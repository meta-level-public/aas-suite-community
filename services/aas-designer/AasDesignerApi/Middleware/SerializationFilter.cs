using AasDesignerApi.Model.Client;
using BaSyx.Models.Export;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AasDesignerApi.Middleware;

public class SerializationFilter : IResultFilter
{
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _logger;

    public SerializationFilter(IHttpContextAccessor accessor, ILogger<SerializationFilter> logger)
    {
        _accessor = accessor;
        _logger = logger;
    }

    public void OnResultExecuted(ResultExecutedContext context) { }

    public void OnResultExecuting(ResultExecutingContext context)
    {
        if (!(context.Result is ObjectResult objectResult))
            return;

        if (objectResult != null && objectResult.Value is ShellResult)
        {
            var env = ((ShellResult?)objectResult?.Value)?.Shell;
            if (env != null)
            {
                // leere listen Variablen in operationen finden
                env.EnvironmentSubmodels?.ForEach(model =>
                {
                    model.SubmodelElements?.ForEach(sme =>
                    {
                        ReplaceEmptyOperationVariablesRecursive(sme.submodelElement);
                    });
                });
                // [5].semanticId.keys[0]'
                env.EnvironmentSubmodels?.ForEach(model =>
                {
                    model.SubmodelElements?.ForEach(sme =>
                    {
                        FixSemanticIdsRecursive(sme.submodelElement);
                    });
                    model.SemanticId?.Keys?.ForEach(v =>
                    {
                        v.Value ??= string.Empty;
                    });
                });
            }
        }
    }

    void ReplaceEmptyOperationVariablesRecursive(SubmodelElementType_V2_0 sme)
    {
        if (sme != null && sme is Operation_V2_0 op)
        {
            var hasSingleEmptyInput =
                op.InputVariables?.Count == 1 && op.InputVariables[0]?.Value == null;
            if (op.InputVariables == null || hasSingleEmptyInput)
            {
                op.InputVariables = new List<OperationVariable_V2_0>();
            }
            var hasSingleEmptyOutput =
                op.OutputVariables?.Count == 1 && op.OutputVariables[0]?.Value == null;
            if (op.OutputVariables == null || hasSingleEmptyOutput)
            {
                op.OutputVariables = new List<OperationVariable_V2_0>();
            }
            var hasSingleEmptyInOutput =
                op.InOutputVariables?.Count == 1 && op.InOutputVariables[0]?.Value == null;
            if (op.InOutputVariables == null || hasSingleEmptyInOutput)
            {
                op.InOutputVariables = new List<OperationVariable_V2_0>();
            }
        }
        else if (sme != null && sme is SubmodelElementCollection_V2_0 smc)
        {
            smc.Value?.ForEach(v => ReplaceEmptyOperationVariablesRecursive(v.submodelElement));
        }
    }

    void FixSemanticIdsRecursive(SubmodelElementType_V2_0 sme)
    {
        if (sme != null && sme.SemanticId != null)
        {
            sme.SemanticId.Keys?.ForEach(v =>
            {
                v.Value ??= string.Empty;
            });
        }
        if (sme != null && sme is SubmodelElementCollection_V2_0 smc)
        {
            smc.Value?.ForEach(v => FixSemanticIdsRecursive(v.submodelElement));
        }
    }
}
