import { CollegeSettings } from '../models/CollegeSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get College Settings
// @route   GET /api/settings/college
// @access  Public
export const getCollegeSettings = asyncHandler(async (req, res) => {
  let settings = await CollegeSettings.findOne();

  if (!settings) {
    settings = await CollegeSettings.create({
      collegeName: 'BMS College of Engineering',
      affiliation: 'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi',
      collegeLogo: '',
      address: 'Bull Temple Road, Basavanagudi, Bengaluru - 560019',
      website: 'https://www.bmsce.ac.in'
    });
  }

  sendResponse(res, 200, 'College settings fetched successfully', settings);
});

// @desc    Update College Settings
// @route   PUT /api/settings/college
// @access  Private (Organizer)
export const updateCollegeSettings = asyncHandler(async (req, res) => {
  const { collegeName, affiliation, collegeLogo, address, website } = req.body;

  let settings = await CollegeSettings.findOne();
  if (!settings) {
    settings = new CollegeSettings();
  }

  if (collegeName !== undefined) settings.collegeName = collegeName.trim();
  if (affiliation !== undefined) settings.affiliation = affiliation.trim();
  if (collegeLogo !== undefined) settings.collegeLogo = collegeLogo;
  if (address !== undefined) settings.address = address.trim();
  if (website !== undefined) settings.website = website.trim();

  await settings.save();
  sendResponse(res, 200, 'College settings updated successfully', settings);
});
