using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using AasDesignerApi.Authorization;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using CsvHelper.Configuration.Attributes;

namespace AasDesignerApi.Model
{
    public class PersistentSetting : IHardDeletable
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
