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
                maybeHardDeletable.ShouldBeHardDeleted = true; // set the flag for IMaybeHardDeletable
            }
            else if (entity is IHardDeletable hardDeletable)
            {
                // do nothing, as HardDeletable is always truly deleted in SaveChanges based on the class
            }
        }

        dbSet.RemoveRange(entities); // call the original RemoveRange
    }

    public static void RemoveHardDelete<T>(this DbSet<T> dbSet, T entity)
        where T : class
    {
        if (entity is IMaybeHardDeletable maybeHardDeletable)
        {
            maybeHardDeletable.ShouldBeHardDeleted = true; // set the flag for IMaybeHardDeletable
        }
        else if (entity is IHardDeletable hardDeletable)
        {
            // do nothing, as HardDeletable is always truly deleted in SaveChanges based on the class
        }

        dbSet.Remove(entity); // call the original Remove
    }
}
