import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import Assignment from "../models/assignmentModel.js";
import Class from "../models/classModel.js";

//------------------- TRAINER ------------------ //

// -------------------CREATE ASSIGNMENT ----------------------------- //

// Create an assignment and link it to a class
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, totalMarks, fileLink, classId } =
    req.body;

  // Validation
  if (!title || !description || !dueDate || !totalMarks || !classId) {
    return res.status(400).json({ error: "Please enter all required fields" });
  }

  if (typeof totalMarks !== "number" || totalMarks <= 0) {
    return res
      .status(400)
      .json({ error: "Total marks must be a positive number" });
  }
  // Retrieve the ID of the currently authenticated trainer from the req object
  const trainerId = req.user._id;

  // Check if the class exists and if the user is the trainer for the class
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({ error: "Class not found" });
  }

  if (classDoc.teacher.toString() !== trainerId.toString()) {
    return res.status(403).json({
      error: "User not authorized to create assignments for this class",
    });
  }

  const newAssignment = new Assignment({
    title,
    description,
    dueDate,
    total_marks: totalMarks,
    fileLink,
    trainer_id: trainerId,
    course_id: classDoc._id,
    class_id: classId,
  });

  try {
    const assignment = await newAssignment.save();
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---- Get an assignment by its ID --------------- //
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  try {
    // Find the assignment by ID
    const assignment = await Assignment.findById(assignmentId)
      .populate("trainer_id", "name email")
      .populate("class_id", "name");
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    // Check if the authenticated user is the trainer who created the assignment
    if (assignment.trainer_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Access denied: You are not the author of this assignment",
      });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --------------------update Assignment BY ID ------------------------ //
const updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, totalMarks, fileLink } = req.body;
  const assignmentId = req.params.id;
  const trainerId = req.user._id;

  let assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  // Ensure the user making the request is the trainer who created the assignment
  if (assignment.trainer_id.toString() !== trainerId.toString()) {
    return res
      .status(403)
      .json({ error: "User not authorized to update this assignment" });
  }

  assignment.title = title || assignment.title;
  assignment.description = description || assignment.description;
  assignment.dueDate = dueDate || assignment.dueDate;
  assignment.total_marks = totalMarks || assignment.total_marks;
  assignment.fileLink = fileLink || assignment.fileLink;

  try {
    const updatedAssignment = await assignment.save();
    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(400);
    throw new Error("Something went wrong");
  }
});

//---------------------- DELETE ASSIGNMENT by ID --------------------- //
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  const trainerId = req.user._id;

  let assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  // Ensure the user making the request is the trainer who created the assignment
  if (assignment.trainer_id.toString() !== trainerId.toString()) {
    return res
      .status(403)
      .json({ error: "User not authorized to delete this assignment" });
  }

  try {
    await Assignment.findOneAndDelete(assignmentId);
    res.status(200).json({ msg: "Assignment removed" });
  } catch (error) {
    res.status(400);
    throw new Error("Something went wrong");
  }
});

// --------- GET ALL ASSIGNMENTS OF current TRAINER (logged In) -------------------- //
const getAssignmentsByTrainer = asyncHandler(async (req, res) => {
  const trainerId = req.user._id;

  try {
    const assignments = await Assignment.find({ trainer_id: trainerId })
      .populate("course_id", "name")
      .populate("trainer_id", "name email");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

//  -----------Get submissions for a specific assignment BY ID --------------- //
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const assignmentId = req.params.id;
  const trainerId = req.user._id;

  try {
    const assignment = await Assignment.findById(assignmentId).populate({
      path: "submissions.student",
      select: "username email",
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the trainer is authorized to view these submissions
    if (assignment.trainer_id.toString() !== trainerId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to view these submissions" });
    }

    res.status(200).json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ----------------- Evaluate a student's submission BY STUDENT ID AND ASSIGNMENT id ------------ //
const evaluateSubmission = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { studentId, marks, rating, remark } = req.body;
  const trainerId = req.user._id;

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the trainer is authorized to evaluate this assignment
    if (assignment.trainer_id.toString() !== trainerId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to evaluate this assignment" });
    }

    // Find the submission by student ID
    const submissionIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Update the submission
    assignment.submissions[submissionIndex].marks = marks;
    assignment.submissions[submissionIndex].rating = rating;
    assignment.submissions[submissionIndex].remark = remark;

    await assignment.save();

    res.status(200).json(assignment.submissions[submissionIndex]);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ---------- Get report for a student's submission OF A PARTICULAR ASSIGNMENT OF A specific student ------ //
const getStudentSubmissionReport = asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;
  const currentUser = req.user;
  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check authorization
    if (
      currentUser.role === "student" &&
      currentUser._id.toString() !== studentId
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only view your own reports." });
    }

    if (
      currentUser.role === "trainer" &&
      assignment.trainer_id.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        error:
          "Access denied. You can only view reports for your own assignments.",
      });
    }

    // Admin can access all reports, so no additional check needed for admin

    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );

    // if (!submission) {
    //   return res.status(404).json({ error: "Submission not found" });
    // }
    res.status(200).json({
      assignmentTitle: assignment.title,
      totalMarks: assignment.total_marks,
      submissionDate: submission?.submissionDate,
      marks: submission?.marks,
      rating: submission?.rating,
      remark: submission?.remark,
      description: assignment.description,
      assignmentFile: assignment.fileLink,
      dueDate: assignment.dueDate,
      submittedFileLink: submission?.fileLink,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

//------------ Get assignments given by the trainer in a specific class -------- //
const getAssignmentsByTrainerForClass = asyncHandler(async (req, res) => {
  const trainerId = req.user._id;
  const classId = req.params.classId;

  try {
    // First, verify that the class exists and the trainer is associated with it
    const classDoc = await Class.findOne({ _id: classId, teacher: trainerId });
    if (!classDoc) {
      return res.status(404).json({
        error: "Class not found or you're not the trainer for this class",
      });
    }

    // Now, fetch all assignments for this class created by this trainer
    const assignments = await Assignment.find({
      trainer_id: trainerId,
      course_id: classId,
    }).select("title description dueDate total_marks fileLink");

    if (assignments.length === 0) {
      return res
        .status(200)
        .json({ message: "No assignments found for this class" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ------------------------- ADMIN -------------------------------- //

//------- Get all assignments of a specific trainer (for admin use) ------------ //
const getAssignmentsByTrainerId = asyncHandler(async (req, res) => {
  const trainerId = req.params.trainerId;

  try {
    const assignments = await Assignment.find({ trainer_id: trainerId })
      .populate("course_id", "name")
      .populate("trainer_id", "name email");

    if (assignments.length === 0) {
      return res
        .status(200)
        .json({ message: "No assignments found for this trainer" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

//-------- Get all assignment reports for a specific student in a specific class -------------- //
const getStudentAssignmentReportsForClass = asyncHandler(async (req, res) => {
  const { classId, studentId } = req.params;
  const currentUser = req.user;

  try {
    // Check if the class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: "Class not found" });
    }
    if (
      currentUser.role === "student" &&
      currentUser._id.toString() !== studentId
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only view your own reports." });
    }
    // Check authorization
    if (
      currentUser.role === "trainer" &&
      classDoc.teacher.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        error: "Access denied. You can only view reports for your own classes.",
      });
    }

    // Admin can access all reports, so no additional check needed for admin

    // Find all assignments for this class
    const assignments = await Assignment.find({ course_id: classId });

    // Collect reports for each assignment
    const reports = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = assignment.submissions.find(
          (sub) => sub.student.toString() === studentId
        );

        return {
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          totalMarks: assignment.total_marks,
          submissionDate: submission ? submission.submissionDate : null,
          marks: submission ? submission.marks : null,
          rating: submission ? submission.rating : null,
          remark: submission ? submission.remark : null,
          submitted: !!submission,
        };
      })
    );

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ---------- Get a specific assignment submission for a specific student in a specific class ---------- //
const getStudentAssignmentInClass = asyncHandler(async (req, res) => {
  const { classId, assignmentId, studentId } = req.params;
  const currentUser = req.user;

  try {
    // Check if the assignment exists and belongs to the specified class
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      course_id: classId,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ error: "Assignment not found in this class" });
    }

    // Check authorization
    if (
      currentUser.role === "student" &&
      currentUser._id.toString() !== studentId
    ) {
      return res.status(403).json({
        error: "Access denied. You can only view your own assignments.",
      });
    }

    if (
      currentUser.role === "trainer" &&
      assignment.trainer_id.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        error:
          "Access denied. You can only view assignments for your own classes.",
      });
    }

    // Find the student's submission
    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );

    if (!submission) {
      return res
        .status(404)
        .json({ error: "Submission not found for this student" });
    }

    res.status(200).json({
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      totalMarks: assignment.total_marks,
      dueDate: assignment.dueDate,
      submissionDate: submission.submissionDate,
      marks: submission.marks,
      rating: submission.rating,
      remark: submission.remark,
      fileLink: submission.fileLink,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ----------------- STUDENT -------------------------- //

// ------ Get all submitted assignments for the logged-in student ------------- //
const getSubmittedAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { classId } = req.params;

  try {
    const assignments = await Assignment.find({
      "submissions.student": studentId,
      class_id: classId,
    })
      .populate("course_id", "name")
      .populate("trainer_id", "name email");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ------------  get all assignments of the class the student is in ---------- //
const getAssignmentsForClass = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const classId = req.params.classId;

  try {
    const classDoc = await Class.findById(classId).populate("students");

    if (!classDoc) {
      return res.status(404).json({ error: "Class not found" });
    }

    if (
      !classDoc.students.some(
        (student) => student._id.toString() === studentId.toString()
      )
    ) {
      return res
        .status(403)
        .json({ error: "You are not a member of this class" });
    }

    const assignments = await Assignment.find({ course_id: classId });

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// -------  Get assignments the student has to submit ------------ //
const getAssignmentsToSubmit = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  try {
    // Fetch the student's enrolled classes
    const student = await Student.findById(studentId).populate("classes");
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const classIds = student.classes.map((classItem) => classItem._id);

    // Fetch assignments that the student has not submitted for their classes
    const assignments = await Assignment.find({
      class_id: { $in: classIds },
      submissions: { $not: { $elemMatch: { student: studentId } } },
    })
      .populate("course_id", "name")
      .populate("trainer_id", "name email");

    if (!assignments.length) {
      return res.status(404).json({ error: "No pending assignments found" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ------Controller for submitting a specific assignment -------- //
const submitAssignment = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { assignmentId } = req.params;
  const { fileLink } = req.body;

  try {
    // Check if the assignment exists
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the student has already submitted the assignment
    const existingSubmission = assignment.submissions.find(
      (submission) => submission.student.toString() === studentId.toString()
    );

    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already submitted this assignment" });
    }

    // Add the student's submission
    const submission = {
      student: studentId,
      fileLink,
      submissionDate: new Date(),
    };

    assignment.submissions.push(submission);

    // Save the assignment with the new submission
    await assignment.save();

    res.status(201).json({ message: "Assignment submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ---------- Get all submitted assignments for a student ---------------- //
const getAllSubmittedAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  try {
    const assignments = await Assignment.find({
      "submissions.student": studentId,
    })
      .populate("course_id", "name")
      .populate("trainer_id", "name email");

    if (!assignments.length) {
      return res.status(404).json({ error: "No submitted assignments found" });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ------Controller for unsubmitting a specific assignment -------- //

const unsubmitAssignment = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { assignmentId } = req.params;

  try {
    // Check if the assignment exists
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if the student has already submitted the assignment
    const existingSubmission = assignment.submissions.find(
      (submission) => submission.student.toString() === studentId.toString()
    );

    if (!existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have not submitted this assignment" });
    }

    // Remove the student's submission
    const index = assignment.submissions.indexOf(existingSubmission);
    assignment.submissions.splice(index, 1);

    // Save

    await assignment.save();

    res.status(200).json({ message: "Assignment unsubmitted successfully" });
  } catch (error) {

    res.status(500).json({ error: "Server Error" });
  }

});

export {
  // trainer
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByTrainer,
  getAssignmentById,
  evaluateSubmission,
  getAssignmentSubmissions,
  getAssignmentsByTrainerForClass,
  getStudentSubmissionReport,

  //   admin
  getAssignmentsByTrainerId,
  getStudentAssignmentReportsForClass,
  getStudentAssignmentInClass,

  // student
  getSubmittedAssignments,
  getAssignmentsForClass,
  getAssignmentsToSubmit,
  submitAssignment,
  unsubmitAssignment,
  // getAllSubmittedAssignments,
};
