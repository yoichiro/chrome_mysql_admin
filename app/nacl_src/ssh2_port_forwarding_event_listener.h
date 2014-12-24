#ifndef SSH2_PORT_FORWARDING_EVENT_LISTENER_H
#define SSH2_PORT_FORWARDING_EVENT_LISTENER_H

#include <string>

class Ssh2PortForwardingEventListener {

 public:

  virtual ~Ssh2PortForwardingEventListener() {};

  virtual void OnHandshakeFinished(const std::string &fingerprint,
                                   const std::string &hostkey_method) = 0;
  virtual void OnWaitingConnection(const int port) = 0;
  virtual void OnForwardingStarted() = 0;
  virtual void OnSentBytes(const int length) = 0;
  virtual void OnReadBytes(const int length) = 0;
  virtual void OnShutdown() = 0;
  virtual void OnErrorOccurred(const std::string &message) = 0;

};

#endif // SSH2_PORT_FORWARDING_EVENT_LISTENER_H
