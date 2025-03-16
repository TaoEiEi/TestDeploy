using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BadmintonCourtManagement.Models
{
    public class Court
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Court name is required")]
        [Display(Name = "Court Name")]
        public string Name { get; set; }

        [Display(Name = "Status")]
        public CourtStatus Status { get; set; } = CourtStatus.Available;

        public virtual ICollection<PlayerCourt> PlayerCourts { get; set; } = new List<PlayerCourt>();
    }

    public enum CourtStatus
    {
        Available,
        Occupied
    }
}

