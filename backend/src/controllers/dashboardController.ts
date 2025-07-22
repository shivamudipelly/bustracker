import { Request, Response } from "express";
import Bus from "../models/Bus";
import User from "../models/User";
import logger from "../config/logger";

// GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "DRIVER" });

    res.status(200).json({
      totalBuses,
      totalDrivers,
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBuses = async (req: Request, res: Response) => {
  try {
    // Fetch all buses
    logger.info('shvia');

    const buses = await Bus.find()
      .populate('driverId', 'name email') // populate driver details
      .lean(); // lean() gives plain JS objects

    if (!buses.length) {
      res.status(404).json({ message: 'No buses found' });
      return;
    }


    res.status(200).json({ buses: buses });

  } catch (error) {
    logger.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Server error while fetching buses', error });
  }
};

export const getBusByEmail = async (req: Request, res: Response) => {
  const { email } = req.query;
  logger.info(email);


  if (!email || typeof email !== 'string') {
    res.status(400).json({ message: 'Email parameter is required.' });
    return
  }

  try {
    // Find the user (driver) by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'Driver not found' });
      return
    }

    // Find the bus associated with this driver
    const bus = await Bus.findOne({ driverId: user._id });
    if (!bus) {
      res.status(404).json({ message: 'Bus not found for this driver' });
      return
    }

    // Return the busId and other necessary details
    res.json({
      busId: bus.busId,
      destiantion: bus.destination,
    });
  } catch (error) {
    logger.error('Error finding bus by email:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
