#ifndef SSH2_PORT_FORWARDING
#define SSH2_PORT_FORWARDING

#include "ppapi/utility/completion_callback_factory.h"
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"
#include "json/json.h"

#include "ssh2_port_forwarding_thread.h"
#include "ssh2_port_forwarding_event_listener.h"

class Ssh2PortForwardingInstance : public pp::Instance, public Ssh2PortForwardingEventListener
{

 public:

  explicit Ssh2PortForwardingInstance(PP_Instance instance);
  virtual ~Ssh2PortForwardingInstance();

  virtual void HandleMessage(const pp::Var &var_message);

  virtual void OnHandshakeFinished(const std::string &fingerprint,
                                   const std::string &hostkey_method);
  virtual void OnWaitingConnection(const int port);
  virtual void OnForwardingStarted();
  virtual void OnSentBytes(const int length);
  virtual void OnReadBytes(const int length);
  virtual void OnShutdown();
  virtual void OnErrorOccurred(const std::string &message);

 private:

  pp::Core *pp_core_;
  pp::CompletionCallbackFactory<Ssh2PortForwardingInstance> factory_;

  Ssh2PortForwardingThread *ssh2_port_forwarding_thread_;

  int GetIntegerValueFromJsonArgs(const Json::Value &args, const int index);
  void Log(const char *message);
  void Log(const int code);
  void SendResponse(const std::string &message, const std::vector<std::string> &values);
  void SendResponseImpl(int32_t result, const std::string &message, const std::vector<std::string> &values);

};

class Ssh2PortForwardingModule : public pp::Module
{

 public:

  Ssh2PortForwardingModule();
  virtual ~Ssh2PortForwardingModule();
  virtual pp::Instance* CreateInstance(PP_Instance instance);

};

namespace pp {

  Module* CreateModule() {
    return new Ssh2PortForwardingModule();
  }

}

#endif // SSH2_PORT_FORWARDING
