using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AasDesignerModel.Exceptions
{
    [Serializable]
    public class OrganisationDomainAlreadyExistsException : Exception
    {
        public OrganisationDomainAlreadyExistsException() { }

        public OrganisationDomainAlreadyExistsException(string? message)
            : base(message) { }

        public OrganisationDomainAlreadyExistsException(string? message, Exception? innerException)
            : base(message, innerException) { }
    }
}
