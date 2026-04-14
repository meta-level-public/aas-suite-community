namespace AasDesignerModel.Model
{
    public class EClassDomain
    {
        public long? Id { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
        public string ReferredType { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;

        // <levels>
        //       <min>true</min>
        //       <max>true</max>
        //     </levels>
        //     <value_type xsi:type="ontoml:REAL_TYPE_Type"/>
    }
}
