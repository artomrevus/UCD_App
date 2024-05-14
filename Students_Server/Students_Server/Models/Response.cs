using System;
namespace UCD_Server.Models
{
	public class Response
	{
        public bool Status { get; }
        public object? ErrorObject { get; }
        public object? Object { get; }

        public Response(bool status, object? errorObject, object? @object)
        {
            Status = status;
            ErrorObject = errorObject;
            Object = @object;
        }
    }
}

