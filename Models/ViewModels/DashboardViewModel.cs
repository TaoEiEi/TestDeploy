using System.Collections.Generic;

namespace BadmintonCourtManagement.Models.ViewModels
{
    public class DashboardViewModel
    {
        public List<CourtViewModel> Courts { get; set; } = new List<CourtViewModel>();
        public List<Player> Players { get; set; } = new List<Player>();
        public PriceSetting PriceSetting { get; set; }
        public List<int> SelectedPlayerIds { get; set; } = new List<int>();
    }
}

