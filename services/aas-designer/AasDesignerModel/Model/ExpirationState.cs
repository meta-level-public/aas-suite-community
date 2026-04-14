namespace AasDesignerModel.Model
{
    public enum ExpirationState
    {
        NOTHING = 0,
        WARNING_EXPIRIATION_IN_7_DAYS = 1,
        WARNING_EXPIRIATION_TODAY = 2,
        WARNING_DELETION_IN_14_DAYS = 3,
        WARNING_DELETION_IN_7_DAYS = 4,
        DELETION_TODAY = 5, // dürfte eigentlich nicht in der DB stehen, weils ja dann gelöscht wird, aber solange wir nur "soft delete" machen, ist es ok
    }
}
