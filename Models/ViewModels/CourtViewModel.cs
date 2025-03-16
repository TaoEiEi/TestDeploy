using System.Collections.Generic;

namespace BadmintonCourtManagement.Models.ViewModels
{
    public class CourtViewModel
    {
        public Court Court { get; set; }
        public List<Player> Players { get; set; } = new List<Player>();
    }
}

