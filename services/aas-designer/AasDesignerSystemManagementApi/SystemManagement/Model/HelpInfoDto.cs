using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace AasDesignerSystemManagementApi.SystemManagement.Model
{
    public class HelpInfoDto
    {
        public DateTime LastModification { get; set; } = DateTime.Now;

        public int AmountTexts { get; set; }
    }
}
