using AasDesignerSystemManagementApi.SystemManagement.MailSettings;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using MediatR;

namespace AasDesignerSystemManagementApi.SystemManagement.Queries.GetMailSettings;

public class GetMailSettingsQuery : IRequest<MailSettingsDto> { }

public class GetMailSettingsHandler : IRequestHandler<GetMailSettingsQuery, MailSettingsDto>
{
    private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;

    public GetMailSettingsHandler(IMailSettingsRuntimeService mailSettingsRuntimeService)
    {
        _mailSettingsRuntimeService = mailSettingsRuntimeService;
    }

    public async Task<MailSettingsDto> Handle(
        GetMailSettingsQuery request,
        CancellationToken cancellationToken
    )
    {
        return MailSettingsSecrets.WithoutPasswords(
            await _mailSettingsRuntimeService.GetMailSettingsAsync(cancellationToken)
        );
    }
}
