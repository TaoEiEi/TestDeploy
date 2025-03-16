using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using BadmintonCourtManagement.Models;
using BadmintonCourtManagement.Data;

namespace BadmintonCourtManagement.Controllers
{
    public class SettingsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Edit()
        {
            var settings = _context.PriceSettings.FirstOrDefault();
            if (settings == null)
            {
                settings = new PriceSetting();
                _context.PriceSettings.Add(settings);
                _context.SaveChanges();
            }
            return View(settings);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(PriceSetting priceSetting)
        {
            if (ModelState.IsValid)
            {
                var settings = _context.PriceSettings.FirstOrDefault();
                if (settings != null)
                {
                    settings.ShuttlecockPrice = priceSetting.ShuttlecockPrice;
                    settings.CourtRentalFee = priceSetting.CourtRentalFee;
                    _context.SaveChanges();
                    TempData["Success"] = "Price settings updated successfully";
                    return RedirectToAction("Index", "Home");
                }
            }
            return View(priceSetting);
        }
    }
}

