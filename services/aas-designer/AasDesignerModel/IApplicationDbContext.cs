using AasDesignerApi.Model;
using AasDesignerModel.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Internal;

namespace AasDesignerModel
{
#pragma warning disable EF1001
    public interface IApplicationDbContext
        : IDisposable,
            IInfrastructure<IServiceProvider>,
            IDbContextDependencies,
            IDbSetCache,
            IDbQueryCache,
            IDbContextPoolable
    {
        DbSet<EclassCertificate> EclassCertificats { get; set; }
        DbSet<EclassCertificateBlob> EclassCertificateBlobs { get; set; }
        DbSet<Organisation> Organisations { get; set; }
        DbSet<AasInfrastructureSettings> AasInfrastructureSettings { get; set; }
        DbSet<Benutzer> Benutzers { get; set; }
        DbSet<Adresse> Adresses { get; set; }
        DbSet<News> News { get; set; }
        DbSet<ProductFamily> ProductFamilys { get; set; }
        DbSet<ProductRoot> ProductRoots { get; set; }
        DbSet<ProductDesignation> ProductDesignations { get; set; }
        DbSet<Snippet> Snippets { get; set; }
        DbSet<StatisticAction> StatisticActions { get; set; }
        DbSet<StatisticData> StatisticDatas { get; set; }
        DbSet<ProtokollEintrag> ProtokollEintraege { get; set; }
        DbSet<PaymentModel> PaymentModels { get; set; }
        DbSet<OrganisationPaymentModel> OrganisationPaymentModels { get; set; }

        DbSet<Rechnungsmonat> Rechnungsmonate { get; set; }
        DbSet<OrgaRechnung> OrgaRechnungen { get; set; }

        DbSet<SharedLink> SharedLinks { get; set; }
        DbSet<Apikey> Apikeys { get; set; }

        DbSet<Mapping> Mappings { get; set; }
        DbSet<CorsConfig> CorsConfigs { get; set; }

        DbSet<SubmodelTemplate> SubmodelTemplates { get; set; }
        DbSet<MlConceptDescription> ConceptDescriptions { get; set; }
        DbSet<EClassClass> EClassClasses { get; set; }
        DbSet<EClassProperty> EClassProperties { get; set; }
        DbSet<EClassMetadata> EClassMetadatas { get; set; }
        DbSet<EClassDatatype> EClassDatatypes { get; set; }
        DbSet<EClassTypeDefinition> EClassTypeDefinitions { get; set; }
        DbSet<EClassConstraint> EClassConstraints { get; set; }
        DbSet<EClassValueMeaning> EClassValueMeanings { get; set; }
        DbSet<EClassImportQueueItem> EClassImportQueueItems { get; set; }
        DbSet<EClassUnit> EClassUnits { get; set; }
        DbSet<RequestForOffer> RequestForOffers { get; set; }
        DbSet<BenutzerOrganisation> BenutzerOrganisations { get; set; }
        DbSet<Invitation> Invitations { get; set; }

        DbSet<DashboardLayout> DashboardLayouts { get; set; }
        DbSet<LayoutPage> LayoutPages { get; set; }
        DbSet<LayoutRow> LayoutRows { get; set; }
        DbSet<LayoutColumn> LayoutColumns { get; set; }

        DbSet<GlobalHelpText> GlobalHelpTexts { get; set; }
        DbSet<OrgaHelpText> OrgaHelpTexts { get; set; }

        DbSet<PcnListener> PcnListeners { get; set; }
        DbSet<PcnNotification> PcnNotifications { get; set; }

        DbSet<DeleteProtocol> DeleteProtocols { get; set; }

        DbSet<PersistentSetting> PersistentSettings { get; set; }

        ChangeTracker ChangeTracker { get; }
        DatabaseFacade Database { get; }

        EntityEntry Add(object entity);
        EntityEntry<TEntity> Add<TEntity>(TEntity entity)
            where TEntity : class;
        void AddRange(IEnumerable<object> entities);
        void AddRange(params object[] entities);
        Task AddRangeAsync(
            IEnumerable<object> entities,
            CancellationToken cancellationToken = default
        );
        Task AddRangeAsync(params object[] entities);
        EntityEntry<TEntity> Attach<TEntity>(TEntity entity)
            where TEntity : class;
        EntityEntry Attach(object entity);
        void AttachRange(params object[] entities);
        void AttachRange(IEnumerable<object> entities);
        EntityEntry<TEntity> Entry<TEntity>(TEntity entity)
            where TEntity : class;
        EntityEntry Entry(object entity);
        bool Equals(object obj);
        object? Find(Type entityType, params object[] keyValues);
        TEntity? Find<TEntity>(params object[] keyValues)
            where TEntity : class;
        int GetHashCode();

        // DbQuery<TQuery> Query<TQuery>() where TQuery : class;
        EntityEntry Remove(object entity);
        EntityEntry<TEntity> Remove<TEntity>(TEntity entity)
            where TEntity : class;
        void RemoveRange(IEnumerable<object> entities);
        void RemoveRange(params object[] entities);
        int SaveChanges(bool acceptAllChangesOnSuccess);
        int SaveChanges();
        Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default
        );
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        DbSet<TEntity> Set<TEntity>()
            where TEntity : class;
        string? ToString();
        EntityEntry Update(object entity);
        EntityEntry<TEntity> Update<TEntity>(TEntity entity)
            where TEntity : class;
        void UpdateRange(params object[] entities);
        void UpdateRange(IEnumerable<object> entities);
#pragma warning restore EF1001
    }

    public interface IDbQueryCache { }
}
