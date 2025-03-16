using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using BadmintonCourtManagement.Models;
using BadmintonCourtManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace BadmintonCourtManagement.Controllers
{
    public class CourtsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CourtsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Court court)
        {
            if (ModelState.IsValid)
            {
                _context.Courts.Add(court);
                _context.SaveChanges();
                TempData["Success"] = "Court added successfully";
                return RedirectToAction("Index", "Home");
            }
            return View(court);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult EndGame(int id)
        {
            var court = _context.Courts
                .Include(c => c.PlayerCourts)
                .ThenInclude(pc => pc.Player)
                .FirstOrDefault(c => c.Id == id);

            if (court == null)
            {
                TempData["Error"] = "Court not found";
                return RedirectToAction("Index", "Home");
            }

            // Update player statuses
            foreach (var playerCourt in court.PlayerCourts)
            {
                playerCourt.Player.Status = PlayerStatus.Available;
            }

            // Remove players from court
            _context.PlayerCourts.RemoveRange(court.PlayerCourts);

            // Update court status
            court.Status = CourtStatus.Available;

            _context.SaveChanges();
            TempData["Success"] = "Game ended successfully";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AddShuttlecock(int id)
        {
            var court = _context.Courts
                .Include(c => c.PlayerCourts)
                .ThenInclude(pc => pc.Player)
                .FirstOrDefault(c => c.Id == id);

            if (court == null || court.PlayerCourts.Count == 0)
            {
                TempData["Error"] = "Court not found or no players in court";
                return RedirectToAction("Index", "Home");
            }

            // Increment shuttlecock count for all players in the court
            foreach (var playerCourt in court.PlayerCourts)
            {
                playerCourt.Player.ShuttlecocksUsed++;
            }

            _context.SaveChanges();
            TempData["Success"] = "Shuttlecock added for all players";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ClearAll()
        {
            // Remove all player-court relationships
            _context.PlayerCourts.RemoveRange(_context.PlayerCourts);

            // Reset player statuses
            var players = _context.Players.ToList();
            foreach (var player in players)
            {
                player.Status = PlayerStatus.Available;
            }

            // Reset court statuses
            var courts = _context.Courts.ToList();
            foreach (var court in courts)
            {
                court.Status = CourtStatus.Available;
            }

            _context.SaveChanges();
            TempData["Success"] = "All data has been reset";
            return RedirectToAction("Index", "Home");
        }
    }
}

