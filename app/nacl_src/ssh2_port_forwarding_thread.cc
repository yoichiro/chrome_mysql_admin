#include <netdb.h>
#include <errno.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <memory>
#include <iterator>
#include <cstdarg>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cstdlib>
#include <cstring>

#include "ppapi/cpp/var.h"

#include "ssh2_port_forwarding_thread.h"

// --- Public method

Ssh2PortForwardingThread::Ssh2PortForwardingThread(pp::Instance *instance,
                                                   Ssh2PortForwardingEventListener *listener)
  : thread_(NULL),
    pp_instance_(instance),
    listener_(listener),
    server_hostname_(""),
    server_port_(-1),
    auth_type_(""),
    username_(""),
    password_(""),
    remote_dest_hostname_(""),
    remote_dest_port_(-1),
    server_sock_(-1),
    session_(NULL)
{
}

Ssh2PortForwardingThread::~Ssh2PortForwardingThread()
{
}

void Ssh2PortForwardingThread::ConnectAndHandshake(const std::string server_hostname,
                                                   const int server_port)
{
  if (!thread_) {
    Log("ConnectAndHandshake");
    Log(server_hostname.c_str());
    Log(server_port);
    server_hostname_ = server_hostname;
    server_port_ = server_port;
    pthread_create(&thread_,
                   NULL,
                   &Ssh2PortForwardingThread::StartConnectAndHandshakeThread,
                   this);
  } else {
    listener_->OnErrorOccurred(std::string("Thread already running"));
  }
}

void Ssh2PortForwardingThread::AuthenticateAndForward(const std::string auth_type,
                                                      const std::string username,
                                                      const std::string password,
                                                      const std::string remote_dest_hostname,
                                                      const int remote_dest_port)
{
  if (!thread_) {
    if (!session_) {
      listener_->OnErrorOccurred(std::string("Not connected and handshaked"));
      return;
    }
    auth_type_ = auth_type;
    username_ = username;
    password_ = password;
    remote_dest_hostname_ = remote_dest_hostname;
    remote_dest_port_ = remote_dest_port;
    pthread_create(&thread_,
                   NULL,
                   &Ssh2PortForwardingThread::StartAuthenticateAndForwardThread,
                   this);
  } else {
    listener_->OnErrorOccurred(std::string("Thread already running"));
  }
}

std::string Ssh2PortForwardingThread::GetPassword()
{
  return password_;
}

// --- Private method

// ----- Connection and handshaking

void* Ssh2PortForwardingThread::StartConnectAndHandshakeThread(void *arg)
{
  Ssh2PortForwardingThread *instance = static_cast<Ssh2PortForwardingThread*>(arg);
  instance->Log("Start connection and handshaking");
  instance->ConnectAndHandshakeImpl();
  return NULL;
}

void Ssh2PortForwardingThread::ConnectAndHandshakeImpl()
{
  if (session_) {
    close(server_sock_);
    CloseSession(session_);
    server_sock_ = -1;
    session_ = NULL;
    Log("Closed already exists Session");
  }
  int sock = -1;
  LIBSSH2_SESSION *session = NULL;
  try {
    InitializeLibssh2();
    sock = ConnectToSshServer(server_hostname_, server_port_);
    session = InitializeSession();
    HandshakeSession(session, sock);
    std::string fingerprint;
    fingerprint = GetHostKeyHash(session);
    Log(fingerprint.c_str());
    server_sock_ = sock;
    session_ = session;
    listener_->OnHandshakeFinished(fingerprint);
  } catch (CommunicationException &e) {
    std::string msg;
    msg = e.toString();
    Log(msg.c_str());
    close(sock);
    CloseSession(session);
    server_sock_ = -1;
    session_ = NULL;
    listener_->OnErrorOccurred(msg);
  }
  thread_ = NULL;
}

void Ssh2PortForwardingThread::InitializeLibssh2() throw(CommunicationException)
{
  int rc;
  rc = libssh2_init(0);
  Log("Libssh2Init()", rc);
  if (rc != 0) {
    THROW_COMMUNICATION_EXCEPTION("libssh2 initialization failed", rc);
  }
}

int Ssh2PortForwardingThread::ConnectToSshServer(const std::string &hostname, const int port)
  throw(CommunicationException)
{
  struct hostent *hostent;
  hostent = gethostbyname(hostname.c_str());
  if (hostent == NULL) {
    THROW_COMMUNICATION_EXCEPTION("hostent is NULL", errno);
  }

  int sock;
  sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);

  struct sockaddr_in sin;
  sin.sin_family = AF_INET;
  sin.sin_port = htons(port);
  memcpy(&sin.sin_addr.s_addr, hostent->h_addr_list[0], hostent->h_length);

  int rc;
  rc = connect(sock, (struct sockaddr*)(&sin), sizeof(struct sockaddr_in));
  if (rc != 0) {
    THROW_COMMUNICATION_EXCEPTION("connect() failed", rc);
  }
  Log("ConnectToSshServer()", rc);

  return sock;
}

LIBSSH2_SESSION* Ssh2PortForwardingThread::InitializeSession()
  throw(CommunicationException)
{
  LIBSSH2_SESSION *session;
  session = libssh2_session_init_ex(NULL, NULL, NULL, this);
  if (!session) {
    THROW_COMMUNICATION_EXCEPTION("libssh2_session_init() failed", 0);
  }
  Log("libssh2_session_init() succeeded");
  return session;
}

void Ssh2PortForwardingThread::HandshakeSession(LIBSSH2_SESSION *session,
                                                int sock)
  throw(CommunicationException)
{
  int rc;
  while ((rc = libssh2_session_handshake(session, sock)) == LIBSSH2_ERROR_EAGAIN);
  if (rc) {
    THROW_COMMUNICATION_EXCEPTION("Error when starting up SSH session", rc);
  }
  Log("Handshaking session succeeded", rc);
}

std::string Ssh2PortForwardingThread::GetHostKeyHash(LIBSSH2_SESSION *session)
{
  const char *fingerprint;
  fingerprint = libssh2_hostkey_hash(session, LIBSSH2_HOSTKEY_HASH_MD5);
  std::ostringstream oss;
  oss.fill('0');
  int i;
  for (i = 0; i < 16; i++) {
    oss << std::setw(2) << std::hex << ((unsigned int)fingerprint[i] & 0xFF);
  }
  std::string result = oss.str();
  return result;
}

// ----- Authentication and forwarding

void* Ssh2PortForwardingThread::StartAuthenticateAndForwardThread(void *arg)
{
  Ssh2PortForwardingThread *instance = static_cast<Ssh2PortForwardingThread*>(arg);
  instance->Log("Start authentication and forwarding");
  instance->AuthenticateAndForwardImpl();
  return NULL;
}

void Ssh2PortForwardingThread::AuthenticateAndForwardImpl()
{
  int listen_sock = -1;
  int forward_sock = -1;
  LIBSSH2_CHANNEL *channel = NULL;
  try {
    AuthenticateUser();
    auto tuple = StartLocalServer(session_,
                                  remote_dest_hostname_,
                                  remote_dest_port_);
    listen_sock = std::get<0>(tuple);
    forward_sock = std::get<1>(tuple);
    channel = std::get<2>(tuple);
    SetNonBlocking(session_);
    listener_->OnForwardingStarted();
    ForwardPacket(forward_sock, channel);
  } catch (CommunicationException &e) {
    std::string msg;
    msg = e.toString();
    Log(msg.c_str());
    listener_->OnErrorOccurred(msg);
  }
  CloseSocket(server_sock_, listen_sock, forward_sock);
  CloseChannel(channel);
  CloseSession(session_);
  listener_->OnShutdown();
  server_sock_ = -1;
  session_ = NULL;
  thread_ = NULL;
}

void Ssh2PortForwardingThread::AuthenticateUser() throw(CommunicationException)
{
  char *user_auth_list;
  user_auth_list = libssh2_userauth_list(session_, username_.c_str(), strlen(username_.c_str()));
  fprintf(stderr, "Authentication methods: %s\n", user_auth_list);

  if (auth_type_ == "password") {
    if (strstr(user_auth_list, auth_type_.c_str())) {
      AuthenticateByPassword(session_, username_, password_);
    } else {
      THROW_COMMUNICATION_EXCEPTION("Authentication type 'password' is not supported", 0);
    }
  } else if (auth_type_ == "keyboard-interactive") {
    if (strstr(user_auth_list, auth_type_.c_str())) {
      AuthenticateByKeyboardInteractive(session_, username_, password_);
    } else {
      THROW_COMMUNICATION_EXCEPTION("Authentication type 'keyboard-interactive' is not supported", 0);
    }
  } else {
    THROW_COMMUNICATION_EXCEPTION("Unknown user authentication type", 0);
  }
}

void Ssh2PortForwardingThread::AuthenticateByPassword(LIBSSH2_SESSION *session,
                                                      const std::string &username,
                                                      const std::string &password)
  throw(CommunicationException)
{
  int rc = -1;
  while((rc = libssh2_userauth_password(session,
                                        username.c_str(),
                                        password.c_str())) == LIBSSH2_ERROR_EAGAIN);
  if (rc) {
    THROW_COMMUNICATION_EXCEPTION("Authentication by password failed", rc);
  }
  Log("Authentication by password succeeded", rc);
}

void Ssh2PortForwardingThread::AuthenticateByKeyboardInteractive(LIBSSH2_SESSION *session,
                                                                 const std::string &username,
                                                                 const std::string &password)
  throw(CommunicationException)
{
  int rc = -1;
  auto callback = &Ssh2PortForwardingThread::KeyboardCallback;
  while((rc = libssh2_userauth_keyboard_interactive(session,
                                                    username.c_str(),
                                                    callback)) == LIBSSH2_ERROR_EAGAIN);
  if (rc) {
    THROW_COMMUNICATION_EXCEPTION("Authentication by keyboard-interactive failed", rc);
  }
  Log("Authentication by keyboard-interactive succeeded", rc);
}

void Ssh2PortForwardingThread::KeyboardCallback(const char *name,
                                                int name_len,
                                                const char *instruction,
                                                int instruction_len,
                                                int num_prompts,
                                                const LIBSSH2_USERAUTH_KBDINT_PROMPT *prompts,
                                                LIBSSH2_USERAUTH_KBDINT_RESPONSE *response,
                                                void **abstract)
{
  (void)name;
  (void)name_len;
  (void)instruction;
  (void)instruction_len;
  Ssh2PortForwardingThread *thread = (Ssh2PortForwardingThread*)*abstract;
  const std::string &password = thread->GetPassword();
  if (num_prompts == 1) {
    response[0].text = const_cast<char*>(password.c_str());
    response[0].length = strlen(password.c_str());
  }
  (void)prompts;
  (void)abstract;
}

std::tuple<int, int, LIBSSH2_CHANNEL*>
Ssh2PortForwardingThread::StartLocalServer(LIBSSH2_SESSION *session,
                                           const std::string &remote_dest_hostname,
                                           const int remote_dest_port)
  throw(CommunicationException)
{
  int start_port = 50000;
  int end_port = 50100;

  const char *local_listen_hostname = "localhost";
  struct hostent *hostent;
  hostent = gethostbyname(local_listen_hostname);
  if (hostent == NULL) {
    THROW_COMMUNICATION_EXCEPTION("hostent is NULL", errno);
  }

  int listen_sock;
  listen_sock = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);

  struct sockaddr_in sin;
  sin.sin_family = AF_INET;
  memcpy(&sin.sin_addr.s_addr, hostent->h_addr_list[0], hostent->h_length);
  socklen_t sin_len;
  sin_len = sizeof(sin);

  int sockopt;
  sockopt = 1;
  setsockopt(listen_sock, SOL_SOCKET, SO_REUSEADDR, &sockopt, sizeof(sockopt));

  int rc;
  int local_listen_port = start_port;
  for (; local_listen_port < end_port; local_listen_port++) {
    sin.sin_port = htons(local_listen_port);
    rc = bind(listen_sock, (struct sockaddr*)&sin, sin_len);
    if (rc != -1) {
      break;
    }
  }

  rc = listen(listen_sock, 2);
  if (rc == -1) {
    close(listen_sock);
    THROW_COMMUNICATION_EXCEPTION("Local server listen failed", rc);
  }

  Log("Waiting for TCP connection");

  listener_->OnWaitingConnection(local_listen_port);

  int forward_sock;
  forward_sock = accept(listen_sock, (struct sockaddr*)&sin, &sin_len); // Blocked
  if (forward_sock == -1) {
    close(listen_sock);
    THROW_COMMUNICATION_EXCEPTION("Local server accept failed", -1);
  }

  char *shost;
  unsigned int sport;
  shost = inet_ntoa(sin.sin_addr);
  sport = ntohs(sin.sin_port);

  LIBSSH2_CHANNEL *channel;
  channel = libssh2_channel_direct_tcpip_ex(session, remote_dest_hostname.c_str(), remote_dest_port, shost, sport);
  if (!channel) {
    close(listen_sock);
    close(forward_sock);
    THROW_COMMUNICATION_EXCEPTION("Could not open the direct-tcpip channel", errno);
  }

  Log("Port forwarding succeeded");

  return std::make_tuple(listen_sock, forward_sock, channel);
}

void Ssh2PortForwardingThread::SetNonBlocking(LIBSSH2_SESSION *session)
{
  libssh2_session_set_blocking(session, 0);
}

void Ssh2PortForwardingThread::ForwardPacket(const int forward_sock,
                                             LIBSSH2_CHANNEL *channel)
  throw(CommunicationException)
{
  fd_set fds;
  struct timeval tv;
  int rc;
  ssize_t len;
  ssize_t wr;
  char buf[16384];
  int i;

  Log("Forwarding started");

  while (1) {
    FD_ZERO(&fds);
    FD_SET(forward_sock, &fds);
    tv.tv_sec = 0;
    tv.tv_usec = 100000;
    rc = select(forward_sock + 1, &fds, NULL, NULL, &tv);
    if (rc == -1) {
      THROW_COMMUNICATION_EXCEPTION("select forward_sock failed", rc);
    }
    if (rc && FD_ISSET(forward_sock, &fds)) {
      len = recv(forward_sock, buf, sizeof(buf), 0);
      if (len < 0) {
        THROW_COMMUNICATION_EXCEPTION("read forward_sock failed", len);
      } else if (len == 0) {
        THROW_COMMUNICATION_EXCEPTION("The client disconnected", len);
      }
      wr = 0;
      do {
        i = libssh2_channel_write(channel, buf, len);
        if (i < 0) {
          THROW_COMMUNICATION_EXCEPTION("libssh2_channel_write:", i);
        }
        wr += i;
      } while (i > 0 && wr < len);
      listener_->OnSentBytes((int)wr);
    }
    while (1) {
      len = libssh2_channel_read(channel, buf, sizeof(buf));
      if (len == LIBSSH2_ERROR_EAGAIN) {
        break;
      } else if (len < 0) {
        THROW_COMMUNICATION_EXCEPTION("libssh2_channel_read:", (int)len);
      }
      wr = 0;
      while (wr < len) {
        i = send(forward_sock, buf + wr, len - wr, 0);
        if (i <= 0) {
          THROW_COMMUNICATION_EXCEPTION("send forward_sock failed", i);
        }
        wr += i;
      }
      listener_->OnReadBytes((int)wr);
      if (libssh2_channel_eof(channel)) {
        Log("The server disconnected");
        return;
      }
    }
  }
}

// ----- Closing

void Ssh2PortForwardingThread::CloseSocket(const int sock,
                                           const int listen_sock,
                                           const int forward_sock)
{
  close(sock);
  close(listen_sock);
  close(forward_sock);
}

void Ssh2PortForwardingThread::CloseChannel(LIBSSH2_CHANNEL *channel)
{
  if (channel) {
    libssh2_channel_free(channel);
  }
}

void Ssh2PortForwardingThread::CloseSession(LIBSSH2_SESSION *session)
{
  if (session) {
    libssh2_session_disconnect(session, "Client disconnecting normally");
    libssh2_session_free(session);
  }
}

// ----- Output log

void Ssh2PortForwardingThread::Log(const char *message)
{
  fprintf(stderr, "Ssh2PortForwardingThread: %s\n", message);
}

void Ssh2PortForwardingThread::Log(const char *message, const int code)
{
  fprintf(stderr, "Ssh2PortForwardingThread: %s %d\n", message, code);
}

void Ssh2PortForwardingThread::Log(const int code)
{
  std::unique_ptr<char[]> rc_str(new char[10]);
  sprintf(rc_str.get(), "%d", code);
  Log(rc_str.get());
}

void Ssh2PortForwardingThread::Log(const std::string &message)
{
  Log(message.c_str());
}
