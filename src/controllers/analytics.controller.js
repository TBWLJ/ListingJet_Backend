import Listing from "../models/Listing.js";
import Lead from "../models/Lead.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import mongoose from "mongoose";

export async function overview(req, res) {
  const [totalListings, totalLeads, listings, recentLeads, events] = await Promise.all([
    Listing.countDocuments({ business: req.user.business }),
    Lead.countDocuments({ business: req.user.business }),
    Listing.find({ business: req.user.business }).sort("-stats.views").limit(5),
    Lead.find({ business: req.user.business }).populate("listing", "title").sort("-createdAt").limit(5),
    AnalyticsEvent.aggregate([
      { $match: { business: req.user.business } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ])
  ]);
  const counts = Object.fromEntries(events.map((item) => [item._id, item.count]));
  const totalViews = counts.page_view || 0;
  res.json({
    metrics: {
      totalListings,
      totalViews,
      totalLeads,
      whatsappClicks: counts.whatsapp_click || 0,
      conversionRate: totalViews ? Number(((totalLeads / totalViews) * 100).toFixed(2)) : 0
    },
    topListings: listings,
    recentLeads,
    monthlyPerformance: await monthlyPerformance(req.user.business)
  });
}

export async function listingAnalytics(req, res) {
  const events = await AnalyticsEvent.aggregate([
    { $match: { business: req.user.business, listing: new mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);
  res.json({ events });
}

async function monthlyPerformance(business) {
  return AnalyticsEvent.aggregate([
    { $match: { business } },
    { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, type: "$type" }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 }
  ]);
}
