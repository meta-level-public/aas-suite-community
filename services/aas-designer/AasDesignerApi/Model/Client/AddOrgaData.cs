namespace AasDesignerApi.Model.Client
{
    public class AddOrgaData
    {
        public OrganisationDto Orga { get; set; } = new OrganisationDto();
        public CreateNewBenutzerDto Admin { get; set; } = new CreateNewBenutzerDto();
    }
}
