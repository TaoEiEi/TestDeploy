using System.ComponentModel.DataAnnotations;

namespace BadmintonCourtManagement.Models
{
    public class PriceSetting
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "Shuttlecock Price")]
        [Range(0, 1000, ErrorMessage = "Price must be between 0 and 1000")]
        public decimal ShuttlecockPrice { get; set; } = 20;

        [Required]
        [Display(Name = "Court Rental Fee")]
        [Range(0, 10000, ErrorMessage = "Fee must be between 0 and 10000")]
        public decimal CourtRentalFee { get; set; } = 0;
    }
}

