#ifndef SSH2_PORT_FORWARDING_THREAD_H
#define SSH2_PORT_FORWARDING_THREAD_H

#include "ppapi/cpp/completion_callback.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"

#include <pthread.h>
#include <tuple>
#include <vector>

#include <libssh2.h>

#include "communication_exception.h"
#include "ssh2_port_forwarding_event_listener.h"

class Ssh2PortForwardingThread
{

 public:

  explicit Ssh2PortForwardingThread(pp::Instance *instance,
                                    Ssh2PortForwardingEventListener *listener);
  virtual ~Ssh2PortForwardingThread();

  void ConnectAndHandshake(const std::string server_hostname, const int server_port);

  void AuthenticateAndForward(const std::string auth_type,
                              const std::string username,
                              const std::string password,
                              const std::string remote_dest_hostname,
                              const int remote_dest_port,
                              const std::string private_key);

  std::string GetPassword();

 private:

  pthread_t thread_;
  pp::Instance *pp_instance_;
  Ssh2PortForwardingEventListener *listener_;

  std::string server_hostname_;
  int server_port_;

  std::string auth_type_;
  std::string username_;
  std::string password_;

  std::string remote_dest_hostname_;
  int remote_dest_port_;
  std::string private_key_;

  int server_sock_;
  LIBSSH2_SESSION *session_;

  static void* StartConnectAndHandshakeThread(void *arg);

  void ConnectAndHandshakeImpl();

  static void* StartAuthenticateAndForwardThread(void *arg);

  void AuthenticateAndForwardImpl();

  void InitializeLibssh2() throw(CommunicationException);

  int ConnectToSshServer(const std::string &hostname,
                         const int port) throw(CommunicationException);

  LIBSSH2_SESSION* InitializeSession() throw(CommunicationException);

  void HandshakeSession(LIBSSH2_SESSION *session,
                        int sock) throw(CommunicationException);

  std::string GetHostKeyHash(LIBSSH2_SESSION *session);

  std::string GetHostKeyMethod(LIBSSH2_SESSION *session);

  void AuthenticateUser() throw(CommunicationException);

  void AuthenticateByPassword(LIBSSH2_SESSION *session,
                              const std::string &username,
                              const std::string &password) throw(CommunicationException);

  void AuthenticateByKeyboardInteractive(LIBSSH2_SESSION *session,
                                         const std::string &username,
                                         const std::string &password) throw(CommunicationException);

  static void KeyboardCallback(const char *name,
                        int name_len,
                        const char *instruction,
                        int instruction_len,
                        int num_prompts,
                        const LIBSSH2_USERAUTH_KBDINT_PROMPT *prompts,
                        LIBSSH2_USERAUTH_KBDINT_RESPONSE *response,
                        void **abstract);

  void AuthenticateByPublicKey(LIBSSH2_SESSION *session,
                               const std::string &username,
                               const std::string &password,
                               const std::string &private_key)
    throw(CommunicationException);

  int SearchUnusedPort() throw(CommunicationException);

  std::tuple<int, int, LIBSSH2_CHANNEL*>
    StartLocalServer(LIBSSH2_SESSION *session,
                     const std::string &remote_dest_hostname,
                     const int remote_dest_port) throw(CommunicationException);

  void SetNonBlocking(LIBSSH2_SESSION *session);

  void ForwardPacket(const int forward_sock,
                     LIBSSH2_CHANNEL *channel) throw(CommunicationException);

  void CloseSocket(const int sock, const int listen_sock, const int forward_sock);

  void CloseSession(LIBSSH2_SESSION *session);

  void CloseChannel(LIBSSH2_CHANNEL *channel);

  void Log(const char *message);

  void Log(const int code);

  void Log(const char *message, const int code);

  void Log(const std::string& message);

};

#endif // SSH2_PORT_FORWARDING_THREAD_H
