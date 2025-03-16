namespace BadmintonCourtManagement.Models
{
    public class PlayerCourt
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public int CourtId { get; set; }
        
        public virtual Player Player { get; set; }
        public virtual Court Court { get; set; }
    }
}

