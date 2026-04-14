using AasDesignerModel;
using AasDesignerModel.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AasDesignerApi.Model
{
    public partial class AasSuiteContext : DbContext, IApplicationDbContext
    {
        public DbSet<EclassCertificate> EclassCertificats { get; set; } = null!;
        public DbSet<EclassCertificateBlob> EclassCertificateBlobs { get; set; } = null!;
        public DbSet<Organisation> Organisations { get; set; } = null!;
        public DbSet<AasInfrastructureSettings> AasInfrastructureSettings { get; set; } = null!;
        public DbSet<Benutzer> Benutzers { get; set; } = null!;
        public DbSet<Adresse> Adresses { get; set; } = null!;
        public DbSet<News> News { get; set; } = null!;
        public DbSet<ProductFamily> ProductFamilys { get; set; } = null!;
        public DbSet<ProductRoot> ProductRoots { get; set; } = null!;
        public DbSet<ProductDesignation> ProductDesignations { get; set; } = null!;
        public DbSet<Snippet> Snippets { get; set; } = null!;
        public DbSet<StatisticAction> StatisticActions { get; set; } = null!;
        public DbSet<StatisticData> StatisticDatas { get; set; } = null!;
        public DbSet<ProtokollEintrag> ProtokollEintraege { get; set; } = null!;
        public DbSet<PaymentModel> PaymentModels { get; set; } = null!;
        public DbSet<OrganisationPaymentModel> OrganisationPaymentModels { get; set; } = null!;

        public DbSet<Rechnungsmonat> Rechnungsmonate { get; set; } = null!;
        public DbSet<OrgaRechnung> OrgaRechnungen { get; set; } = null!;

        public DbSet<SharedLink> SharedLinks { get; set; } = null!;
        public DbSet<Apikey> Apikeys { get; set; } = null!;

        public DbSet<Mapping> Mappings { get; set; } = null!;
        public DbSet<CorsConfig> CorsConfigs { get; set; } = null!;

        public DbSet<SubmodelTemplate> SubmodelTemplates { get; set; } = null!;
        public DbSet<MlConceptDescription> ConceptDescriptions { get; set; } = null!;
        public DbSet<EClassClass> EClassClasses { get; set; } = null!;
        public DbSet<EClassProperty> EClassProperties { get; set; } = null!;
        public DbSet<EClassMetadata> EClassMetadatas { get; set; } = null!;
        public DbSet<EClassDatatype> EClassDatatypes { get; set; } = null!;
        public DbSet<EClassTypeDefinition> EClassTypeDefinitions { get; set; } = null!;
        public DbSet<EClassConstraint> EClassConstraints { get; set; } = null!;
        public DbSet<EClassValueMeaning> EClassValueMeanings { get; set; } = null!;
        public DbSet<EClassImportQueueItem> EClassImportQueueItems { get; set; } = null!;
        public DbSet<EClassUnit> EClassUnits { get; set; } = null!;
        public DbSet<RequestForOffer> RequestForOffers { get; set; } = null!;
        public DbSet<BenutzerOrganisation> BenutzerOrganisations { get; set; } = null!;
        public DbSet<Invitation> Invitations { get; set; } = null!;

        public DbSet<DashboardLayout> DashboardLayouts { get; set; } = null!;
        public DbSet<LayoutPage> LayoutPages { get; set; } = null!;
        public DbSet<LayoutRow> LayoutRows { get; set; } = null!;
        public DbSet<LayoutColumn> LayoutColumns { get; set; } = null!;

        public DbSet<GlobalHelpText> GlobalHelpTexts { get; set; } = null!;
        public DbSet<OrgaHelpText> OrgaHelpTexts { get; set; } = null!;

        public DbSet<PcnListener> PcnListeners { get; set; }
        public DbSet<PcnNotification> PcnNotifications { get; set; }

        public DbSet<DeleteProtocol> DeleteProtocols { get; set; }
        public DbSet<PersistentSetting> PersistentSettings { get; set; }

        private static IHttpContextAccessor? _context;
        private readonly ILogger<DbContext>? _logger;

        public static void Configure(IHttpContextAccessor? context)
        {
            _context = context;
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }

        public AasSuiteContext() { }

        public AasSuiteContext(ILogger<DbContext> logger)
        {
            _logger = logger;
            logger.LogTrace("AasSuiteContext::ctor without options");
        }

        public AasSuiteContext(DbContextOptions<AasSuiteContext> options)
            : base(options) { }

        public AasSuiteContext(DbContextOptions<AasSuiteContext> options, ILogger<DbContext> logger)
            : base(options)
        {
            _logger = logger;
            logger.LogTrace("AasSuiteContext::ctor with options");
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            _logger?.LogTrace($"OnConfiguring: isConfigured? {optionsBuilder.IsConfigured}");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var stringListComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<
                List<string>
            >(
                (c1, c2) => c1!.SequenceEqual(c2!),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList()
            );

            var dictStringObjectComparer =
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<
                    Dictionary<string, object?>
                >(
                    (c1, c2) => c1!.Count == c2!.Count && !c1.Except(c2).Any(),
                    c =>
                        c.Aggregate(
                            0,
                            (a, v) =>
                                HashCode.Combine(
                                    a,
                                    v.Key.GetHashCode(),
                                    v.Value != null ? v.Value.GetHashCode() : 0
                                )
                        ),
                    c => new Dictionary<string, object?>(c)
                );

            var dictStringStringComparer =
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<
                    Dictionary<string, string>
                >(
                    (c1, c2) => c1!.Count == c2!.Count && !c1.Except(c2).Any(),
                    c =>
                        c.Aggregate(
                            0,
                            (a, v) =>
                                HashCode.Combine(a, v.Key.GetHashCode(), v.Value.GetHashCode())
                        ),
                    c => new Dictionary<string, string>(c)
                );

            var mlpKeyValueListComparer =
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<MlpKeyValue>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                );

            var headerParameterListComparer =
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<
                    List<HeaderParameter>
                >(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                );

            modelBuilder
                .Entity<Benutzer>()
                .Property(e => e.BenutzerRollen)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<Benutzer>()
                .Property(e => e.Einstellungen)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<BenutzerEinstellungen>(v)
                );

            modelBuilder
                .Entity<Benutzer>()
                .HasIndex(e => new { e.ExternalIdentityProvider, e.ExternalIdentitySubject });

            modelBuilder
                .Entity<ProtokollEintrag>()
                .Property(e => e.OldValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, object?>>(v)
                )
                .Metadata.SetValueComparer(dictStringObjectComparer);

            modelBuilder
                .Entity<ProtokollEintrag>()
                .Property(e => e.NewValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, object?>>(v)
                )
                .Metadata.SetValueComparer(dictStringObjectComparer);

            modelBuilder
                .Entity<ProtokollEintrag>()
                .Property(e => e.KeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, object?>>(v)
                )
                .Metadata.SetValueComparer(dictStringObjectComparer);

            modelBuilder
                .Entity<ProtokollEintrag>()
                .Property(e => e.ChangedColumns)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<Apikey>()
                .Property(e => e.Scopes)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<Organisation>()
                .HasMany(e => e.OwnedEclassData)
                .WithMany(e => e.Organisations);

            modelBuilder
                .Entity<AasInfrastructureSettings>()
                .Property(e => e.HeaderParameters)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<HeaderParameter>>(v)
                )
                .Metadata.SetValueComparer(headerParameterListComparer);

            modelBuilder
                .Entity<EClassConstraint>()
                .Property(e => e.Subset)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<EClassMetadata>()
                .Property(e => e.Languages)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<EClassClass>()
                .Property(e => e.PreferredName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassClass>()
                .Property(e => e.Keywords)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassClass>()
                .Property(e => e.ShortName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassClass>()
                .Property(e => e.Definition)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassProperty>()
                .Property(e => e.PreferredName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassProperty>()
                .Property(e => e.ShortName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassProperty>()
                .Property(e => e.Definition)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassUnit>()
                .Property(e => e.PreferredName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassUnit>()
                .Property(e => e.ShortName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassUnit>()
                .Property(e => e.Definition)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassUnit>()
                .Property(e => e.CodeListValue)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassUnit>()
                .Property(e => e.Name)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassDatatype>()
                .Property(e => e.Definition)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);
            modelBuilder
                .Entity<EClassDatatype>()
                .Property(e => e.PreferredName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassValueMeaning>()
                .Property(e => e.Definition)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassValueMeaning>()
                .Property(e => e.PreferredName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<EClassValueMeaning>()
                .Property(e => e.ShortName)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<Dictionary<string, string>>(v)
                )
                .Metadata.SetValueComparer(dictStringStringComparer);

            modelBuilder
                .Entity<BenutzerOrganisation>()
                .Property(e => e.BenutzerRollen)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<string>>(v)
                )
                .Metadata.SetValueComparer(stringListComparer);

            modelBuilder
                .Entity<Adresse>()
                .Property(e => e.NameMlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<Adresse>()
                .Property(e => e.StrasseMlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<Adresse>()
                .Property(e => e.OrtMlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<Adresse>()
                .Property(e => e.BundeslandMlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<ProductFamily>()
                .Property(e => e.MlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<ProductRoot>()
                .Property(e => e.MlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);

            modelBuilder
                .Entity<ProductDesignation>()
                .Property(e => e.MlpKeyValues)
                .HasConversion(
                    v => DBJsonConverter.Serialize(v),
                    v => DBJsonConverter.Deserialize<List<MlpKeyValue>>(v)
                )
                .Metadata.SetValueComparer(mlpKeyValueListComparer);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            OnBeforeSaving();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            OnBeforeSaving();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        private void OnBeforeSaving()
        {
            var entries = ChangeTracker.Entries();
            var user = _context?.HttpContext?.Items["AppUser"] as AppUser;
            foreach (var entry in entries)
            {
                if (entry.Entity is IMetadata)
                {
                    var e = entry.Entity as IMetadata;
                    if (entry.State == EntityState.Added && e != null)
                    {
                        e.AnlageDatum = DateTime.Now.ToUniversalTime();
                        e.AenderungsDatum = DateTime.Now.ToUniversalTime();
                        e.AenderungsZaehler = 0;
                        if (_context != null && _context.HttpContext != null)
                        {
                            if (user != null)
                            {
                                e.AenderungsBenutzer = user.Benutzer.Email;
                                e.AnlageBenutzer = user.Benutzer.Email;
                            }
                        }
                    }
                    if (entry.State == EntityState.Modified && e != null)
                    {
                        e.AenderungsDatum = DateTime.Now.ToUniversalTime();
                        e.AenderungsZaehler = e.AenderungsZaehler + 1;
                        if (_context != null && _context.HttpContext != null)
                        {
                            if (user != null)
                            {
                                e.AenderungsBenutzer = user.Benutzer.Email;
                            }
                        }
                    }
                    if (
                        entry.State == EntityState.Deleted
                        && e != null
                        && !(e is IHardDeletable)
                        && (
                            entry.State == EntityState.Deleted
                            && e is IMaybeHardDeletable
                            && ((IMaybeHardDeletable)e).ShouldBeHardDeleted == false
                        )
                    )
                    {
                        e.Geloescht = true;
                        e.AenderungsDatum = DateTime.Now.ToUniversalTime();
                        e.AenderungsZaehler = e.AenderungsZaehler + 1;
                        if (_context != null && _context.HttpContext != null)
                        {
                            if (user != null)
                            {
                                e.AenderungsBenutzer = user.Benutzer.Email;
                            }
                        }
                        entry.State = EntityState.Modified;
                    }
                }
            }

            #region Protokollierung
            var protokollEintraege = new List<ProtokollEintrag>();

            foreach (var entry in entries.Where(e => e.State != EntityState.Unchanged))
            {
                if (entry.Entity is IProtokollierbar)
                {
                    var protokollEintrag = new ProtokollEintrag { AenderungsDatum = DateTime.Now };
                    if (user != null)
                    {
                        protokollEintrag.AendererName = user.Benutzer.Email;
                        protokollEintrag.AendererId = user.Benutzer.Id;
                    }

                    protokollEintrag.Tabellenname = entry.Metadata.Name;
                    foreach (var property in entry.Properties)
                    {
                        if (property != null)
                        {
                            string propertyName = property.Metadata.Name;
                            switch (entry.State)
                            {
                                case EntityState.Added:
                                    protokollEintrag.AenderungsTyp =
                                        AenderungsTyp.HINZUGEFUEGT.ToString();
                                    break;
                                case EntityState.Deleted:
                                    protokollEintrag.AenderungsTyp =
                                        AenderungsTyp.GELOESCHT.ToString();
                                    break;
                                case EntityState.Modified:
                                    protokollEintrag.AenderungsTyp =
                                        AenderungsTyp.GEAENDERT.ToString();
                                    break;
                            }
                            if (property.Metadata.IsPrimaryKey())
                            {
                                protokollEintrag.KeyValues[propertyName] = property.CurrentValue;
                                continue;
                            }
                            switch (entry.State)
                            {
                                case EntityState.Added:
                                    protokollEintrag.NewValues[propertyName] =
                                        property.CurrentValue;
                                    break;
                                case EntityState.Deleted:
                                    protokollEintrag.OldValues[propertyName] =
                                        property.OriginalValue;
                                    break;
                                case EntityState.Modified:
                                    if (property.IsModified)
                                    {
                                        protokollEintrag.ChangedColumns.Add(propertyName);
                                        protokollEintrag.OldValues[propertyName] =
                                            property.OriginalValue;
                                        protokollEintrag.NewValues[propertyName] =
                                            property.CurrentValue;
                                    }
                                    break;
                            }
                        }
                    }
                    protokollEintraege.Add(protokollEintrag);
                }
            }

            protokollEintraege.ForEach(protokollEintrag =>
            {
                Add(protokollEintrag);
            });
            #endregion
        }
    }
}
