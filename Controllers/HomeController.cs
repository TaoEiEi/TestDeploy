using System;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BadmintonCourtManagement.Models;
using BadmintonCourtManagement.Data;
using BadmintonCourtManagement.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace BadmintonCourtManagement.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
        {
            var viewModel = new DashboardViewModel
            {
                Courts = GetCourtViewModels(),
                Players = _context.Players.OrderBy(p => p.Status).ToList(),
                PriceSetting = _context.PriceSettings.FirstOrDefault() ?? new PriceSetting()
            };

            return View(viewModel);
        }

        private List<CourtViewModel> GetCourtViewModels()
        {
            var courts = _context.Courts
                .Include(c => c.PlayerCourts)
                .ThenInclude(pc => pc.Player)
                .ToList();

            var courtViewModels = new List<CourtViewModel>();

            foreach (var court in courts)
            {
                var players = court.PlayerCourts.Select(pc => pc.Player).ToList();
                
                courtViewModels.Add(new CourtViewModel
                {
                    Court = court,
                    Players = players
                });
            }

            return courtViewModels;
        }

        [HttpPost]
        public IActionResult AddSelectedPlayersToAvailableCourt(string selectedPlayerIds)
        {
            if (string.IsNullOrEmpty(selectedPlayerIds))
            {
                TempData["Error"] = "No players selected";
                return RedirectToAction(nameof(Index));
            }

            // Parse the comma-separated player IDs
            var playerIdArray = selectedPlayerIds.Split(',').Select(int.Parse).ToArray();

            // Find an available court
            var availableCourt = _context.Courts
                .Include(c => c.PlayerCourts)
                .Where(c => c.Status == CourtStatus.Available)
                .OrderBy(c => c.PlayerCourts.Count)
                .FirstOrDefault();

            if (availableCourt == null)
            {
                TempData["Error"] = "No available courts";
                return RedirectToAction(nameof(Index));
            }

            // Get selected players that are available
            var selectedPlayers = _context.Players
                .Where(p => playerIdArray.Contains(p.Id) && p.Status == PlayerStatus.Available)
                .Take(4 - availableCourt.PlayerCourts.Count) // Only take what fits in the court
                .ToList();

            if (selectedPlayers.Count == 0)
            {
                TempData["Error"] = "No available players selected";
                return RedirectToAction(nameof(Index));
            }

            // Add players to court
            foreach (var player in selectedPlayers)
            {
                // Update player status and game count
                player.Status = PlayerStatus.Playing;
                player.GamesPlayed++;
                player.ShuttlecocksUsed++;

                // Add player to court
                _context.PlayerCourts.Add(new PlayerCourt
                {
                    PlayerId = player.Id,
                    CourtId = availableCourt.Id
                });
            }

            // Update court status
            availableCourt.Status = CourtStatus.Occupied;

            _context.SaveChanges();
            TempData["Success"] = "Players added to court successfully";
            return RedirectToAction(nameof(Index));
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

