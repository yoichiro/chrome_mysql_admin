#include <sstream>

#include "communication_exception.h"

CommunicationException::CommunicationException(const std::string message,
                                               const int result_code,
                                               const char *file_name,
                                               const char *function_name,
                                               const int line_number)
  :message_(message),
   result_code_(result_code),
   file_name_(file_name),
   function_name_(function_name),
   line_number_(line_number)
{
}

CommunicationException::~CommunicationException() throw()
{
}

const char* CommunicationException::what() const throw()
{
  return message_.c_str();
}

const int CommunicationException::getResultCode()
{
  return result_code_;
}

const char* CommunicationException::getFileName()
{
  return file_name_;
}

const char* CommunicationException::getFunctionName()
{
  return function_name_;
}

const int CommunicationException::getLineNumber()
{
  return line_number_;
}

const std::string CommunicationException::toString()
{
  std::ostringstream oss;
  oss << message_.c_str() << " ";
  oss << result_code_;
  std::string result = oss.str();
  return result;
}
