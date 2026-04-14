using AasDesignerApi.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Extensions;

public static class DbSetExtensions
{
    public static void RemoveRangeHardDelete<T>(this DbSet<T> dbSet, IEnumerable<T> entities)
        where T : class
    {
        foreach (var entity in entities)
        {
            if (entity is IMaybeHardDeletable maybeHardDeletable)
            {
                maybeHardDeletable.ShouldBeHardDeleted = true; // Setze das Flag für IMaybeHardDeletable
            }
            else if (entity is IHardDeletable hardDeletable)
            {
                // nichts tun, da  HardDeletable in der SaveChanges anhand der Klasse immer echt gelöscht wird
            }
        }

        dbSet.RemoveRange(entities); // Rufe das originale RemoveRange auf
    }

    public static void RemoveHardDelete<T>(this DbSet<T> dbSet, T entity)
        where T : class
    {
        if (entity is IMaybeHardDeletable maybeHardDeletable)
        {
            maybeHardDeletable.ShouldBeHardDeleted = true; // Setze das Flag für IMaybeHardDeletable
        }
        else if (entity is IHardDeletable hardDeletable)
        {
            // nichts tun, da  HardDeletable in der SaveChanges anhand der Klasse immer echt gelöscht wird
        }

        dbSet.Remove(entity); // Rufe das originale RemoveRange auf
    }
}
