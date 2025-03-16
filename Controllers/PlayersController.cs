using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using BadmintonCourtManagement.Models;
using BadmintonCourtManagement.Data;

namespace BadmintonCourtManagement.Controllers
{
    public class PlayersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PlayersController(ApplicationDbContext context)
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
        public IActionResult Create(Player player)
        {
            if (ModelState.IsValid)
            {
                _context.Players.Add(player);
                _context.SaveChanges();
                TempData["Success"] = "Player added successfully";
                return RedirectToAction("Index", "Home");
            }
            return View(player);
        }
    }
}

