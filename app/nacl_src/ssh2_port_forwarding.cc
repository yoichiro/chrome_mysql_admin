#include <cstdio>
#include <sstream>
#include <memory>
#include <sys/mount.h>

#include <errno.h>

#include "nacl_io/nacl_io.h"

#include "ssh2_port_forwarding.h"

// class Ssh2PortForwardingInstance

Ssh2PortForwardingInstance::Ssh2PortForwardingInstance(PP_Instance instance)
  : pp::Instance(instance),
    pp_core_(pp::Module::Get()->core()),
    factory_(this)
{
  nacl_io_init_ppapi(instance, pp::Module::Get()->get_browser_interface());
  mount("", "/cma", "memfs", 0, "");
  ssh2_port_forwarding_thread_ = new Ssh2PortForwardingThread(this, this);
  Log("Instance created.");
}

Ssh2PortForwardingInstance::~Ssh2PortForwardingInstance()
{
  delete ssh2_port_forwarding_thread_;
}

void Ssh2PortForwardingInstance::HandleMessage(const pp::Var &var_message)
{
  Log("Message handled");
  if (!var_message.is_string()) {
    return;
  }

  Json::Value root;
  if (Json::Reader().parse(var_message.AsString(), root) &&
      root.isObject()) {
    std::string command = root["command"].asString();
    const Json::Value& args = root["args"];
    if (!command.empty() && args.isArray()) {
      if (command == "connect") {
        std::string server_hostname = args[0].asString();
        std::string server_port_string = args[1].asString();
        int server_port;
        sscanf(server_port_string.c_str(), "%d", &server_port);
        ssh2_port_forwarding_thread_->ConnectAndHandshake(server_hostname,
                                                          server_port);
      } else if (command == "forward") {
        std::string auth_type = args[0].asString();
        std::string username = args[1].asString();
        std::string password = args[2].asString();
        std::string remote_dest_hostname = args[3].asString();
        int remote_dest_port = GetIntegerValueFromJsonArgs(args, 4);
        std::string private_key  = args[5].asString();
        ssh2_port_forwarding_thread_->AuthenticateAndForward(auth_type,
                                                             username,
                                                             password,
                                                             remote_dest_hostname,
                                                             remote_dest_port,
                                                             private_key);
      }
    }
  }
}

int Ssh2PortForwardingInstance::GetIntegerValueFromJsonArgs(const Json::Value &args,
                                                            const int index)
{
  std::string str = args[index].asString();
  int result;
  sscanf(str.c_str(), "%d", &result);
  return result;
}

void Ssh2PortForwardingInstance::OnHandshakeFinished(const std::string &fingerprint,
                                                     const std::string &hostkey_method)
{
  SendResponse(std::string("fingerprint"),
               std::vector<std::string>{fingerprint, hostkey_method});
}

void Ssh2PortForwardingInstance::OnWaitingConnection(const int port)
{
  std::ostringstream oss;
  oss << port;
  SendResponse(std::string("waiting"), std::vector<std::string>{oss.str()});
}

void Ssh2PortForwardingInstance::OnForwardingStarted()
{
  SendResponse(std::string("forward_starting"), std::vector<std::string>{});
}

void Ssh2PortForwardingInstance::OnSentBytes(const int length)
{
  std::ostringstream oss;
  oss << length;
  SendResponse(std::string("sent"),
               std::vector<std::string>{oss.str()});
}

void Ssh2PortForwardingInstance::OnReadBytes(const int length)
{
  std::ostringstream oss;
  oss << length;
  SendResponse(std::string("read"),
               std::vector<std::string>{oss.str()});
}

void Ssh2PortForwardingInstance::OnShutdown()
{
  SendResponse(std::string("shutdown"), std::vector<std::string>{});
}

void Ssh2PortForwardingInstance::OnErrorOccurred(const std::string &message)
{
  SendResponse(std::string("error"), std::vector<std::string>{message});
}

void Ssh2PortForwardingInstance::Log(const char *message)
{
  fprintf(stderr, "Ssh2PortForwardingInstance: %s\n", message);
}

void Ssh2PortForwardingInstance::Log(const int code)
{
  std::unique_ptr<char[]> rc_str(new char[10]);
  sprintf(rc_str.get(), "%d", code);
  Log(rc_str.get());
}

void Ssh2PortForwardingInstance::SendResponse(const std::string &message,
                                              const std::vector<std::string> &values)
{
  pp::CompletionCallback callback =
    factory_.NewCallback(&Ssh2PortForwardingInstance::SendResponseImpl,
                         message,
                         values);
  pp_core_->CallOnMainThread(0, callback);
}

void Ssh2PortForwardingInstance::SendResponseImpl(int32_t result,
                                                  const std::string &message,
                                                  const std::vector<std::string> &values)
{
  Json::Value root(Json::objectValue);
  root["message"] = message;
  Json::Value json_values(Json::arrayValue);
  std::vector<std::string>::const_iterator i;
  for (i = values.begin(); i != values.end(); ++i) {
    std::string value = *i;
    json_values.append(value);
  }
  root["values"] = json_values;

  Json::FastWriter writer;
  std::string json = writer.write(root);
  PostMessage(pp::Var(json));
}

// class Ssh2PortForwardingModule

Ssh2PortForwardingModule::Ssh2PortForwardingModule()
  : pp::Module()
{
}

Ssh2PortForwardingModule::~Ssh2PortForwardingModule()
{
}

pp::Instance* Ssh2PortForwardingModule::CreateInstance(PP_Instance instance)
{
  return new Ssh2PortForwardingInstance(instance);
}
