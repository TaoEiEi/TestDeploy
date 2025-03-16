using BadmintonCourtManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace BadmintonCourtManagement.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Court> Courts { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<PlayerCourt> PlayerCourts { get; set; }
        public DbSet<PriceSetting> PriceSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<PlayerCourt>()
                .HasOne(pc => pc.Player)
                .WithMany(p => p.PlayerCourts)
                .HasForeignKey(pc => pc.PlayerId);

            modelBuilder.Entity<PlayerCourt>()
                .HasOne(pc => pc.Court)
                .WithMany(c => c.PlayerCourts)
                .HasForeignKey(pc => pc.CourtId);

            // Seed initial price setting
            modelBuilder.Entity<PriceSetting>().HasData(
                new PriceSetting
                {
                    Id = 1,
                    ShuttlecockPrice = 20,
                    CourtRentalFee = 0
                }
            );
        }
    }
}

