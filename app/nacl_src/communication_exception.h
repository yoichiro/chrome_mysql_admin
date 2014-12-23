#ifndef COMMUNICATION_EXCEPTION_H
#define COMMUNICATION_EXCEPTION_H

#include <exception>
#include <string>

#define THROW_COMMUNICATION_EXCEPTION(message, result_code) \
  std::string msg = message; \
  throw CommunicationException(msg, result_code, __FILE__, __func__, __LINE__)

class CommunicationException : public std::exception {

 public:

  CommunicationException(const std::string message,
                         const int result_code,
                         const char *file_name,
                         const char *function_name,
                         const int line_number);
  virtual ~CommunicationException() throw();
  const int getResultCode();
  const char* getFileName();
  const char* getFunctionName();
  const int getLineNumber();
  virtual const char* what() const throw();
  const std::string toString();

 private:

  const std::string message_;
  const int result_code_;
  const char *file_name_;
  const char *function_name_;
  const int line_number_;

};

#endif // COMMUNICATION_EXCEPTION_H
