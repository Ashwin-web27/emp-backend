const Employee = require('../models/Employee');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Add new employee
// @route   POST /api/v1/employees
// @access  Private (any authenticated user)
exports.addEmployee = asyncHandler(async (req, res, next) => {
  // Automatically set referredBy to current user
  req.body.referredBy = req.user.id;

  const employee = await Employee.create(req.body);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private (any authenticated user)
exports.getEmployees = asyncHandler(async (req, res, next) => {
  let queryParams = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete queryParams[param]);

  let queryStr = JSON.stringify(queryParams);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  let query = Employee.find(JSON.parse(queryStr)).populate({
    path: 'referredBy',
    select: 'fullName email role',
  });

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Employee.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  const employees = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: employees.length,
    pagination,
    data: employees,
  });
});

// @desc    Get employees by referral code
// @route   GET /api/v1/employees/referred/:referralCode
// @access  Private (any authenticated user)
exports.getEmployeesByReferral = asyncHandler(async (req, res, next) => {
  const query = { referralCode: req.params.referralCode };

  const employees = await Employee.find(query).populate({
    path: 'referredBy',
    select: 'fullName email role',
  });

  if (!employees || employees.length === 0) {
    return next(
      new ErrorResponse(
        `No employees found with referral code ${req.params.referralCode}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private (any authenticated user)
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate({
      path: 'referredBy',
      select: 'fullName email role',
    })
    .populate({
      path: 'referredEmployees',
      select: 'fullName email status createdAt',
    });

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc    Get current user's referred employees
// @route   GET /api/v1/employees/me/referred
// @access  Private (any authenticated user)
exports.getMyReferredEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find({ referredBy: req.user.id })
    .select('fullName email status createdAt lastLogin')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  await employee.deleteOne();  // Use deleteOne instead of remove

  res.status(200).json({
    success: true,
    data: {},
    message: 'Employee deleted successfully',
  });
});
