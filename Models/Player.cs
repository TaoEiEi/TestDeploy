using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BadmintonCourtManagement.Models
{
    public class Player
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Player name is required")]
        [Display(Name = "Player Name")]
        public string Name { get; set; }

        [Display(Name = "Status")]
        public PlayerStatus Status { get; set; } = PlayerStatus.Available;

        [Display(Name = "Games Played")]
        public int GamesPlayed { get; set; } = 0;

        [Display(Name = "Shuttlecocks Used")]
        public int ShuttlecocksUsed { get; set; } = 0;

        public virtual ICollection<PlayerCourt> PlayerCourts { get; set; } = new List<PlayerCourt>();
    }

    public enum PlayerStatus
    {
        Available,
        Playing
    }
}

