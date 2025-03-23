import { v4 } from "uuid";
import { db } from "../models/db.js";
import { DepartmentSpec, StaffSpec } from "../models/joi-schemas.js";

export const departmentController = {
  index: {
    handler: async function (request, h) {
      const department = await db.departmentStore.getDepartmentById(request.params.id);
      if (!department) {
        return h.response("Department not found").code(404);
      }

      const hospital = await db.hospitalStore.getHospitalById(department.hospitalId);
      if (!hospital) {
        return h.response("Hospital not found").code(404);
      }
      
      const staff = await db.staffStore.getStaffByDepartmentId(department._id);
      
      const viewData = {
        title: "Department",
        hospital: hospital,
        department: department,
        staff: staff,
      };
      return h.view("department-view", viewData);
    },
  },

  addDepartment: {
    validate: {
      payload: DepartmentSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        console.log("Validation Error:", error.details);
        return h.view("hospital-view", { 
          title: "Add department error", 
          errors: error.details 
        }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      console.log("Params received:", request.params);
      const hospital = await db.hospitalStore.getHospitalById(request.params.hospitalId);
      
      if (!hospital) {
        return h.response("Hospital not found").code(404);
      }
  
      const newDepartment = {
        hospitalId: hospital._id,
        title: request.payload.title, 
        deptLocation: request.payload.deptLocation 
      };
  
      await db.departmentStore.addDepartment(newDepartment);
      console.log("New department added:", newDepartment);
      return h.redirect(`/hospital/${hospital._id}`);
    },
  },

  addStaff: {
    validate: {
      payload: StaffSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("department-view", { title: "Add staff error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const department = await db.departmentStore.getDepartmentById(request.params.id);
      if (!department) {
        return h.response("Department not found").code(404);
      }
    
      const hospital = await db.hospitalStore.getHospitalById(department.hospitalId);
      if (!hospital) {
        return h.response("Hospital not found").code(404);
      }
    
      const newStaff = {
        role: request.payload.role,
        name: request.payload.name,
        vignette: request.payload.vignette,
        departmentId: department._id, 
      };
    
      await db.staffStore.addStaff(newStaff);
      return h.redirect(`/hospital/${hospital._id}/department/${department._id}`);
    },
  },

  deleteStaff: {
    handler: async function (request, h) {
      const department = await db.departmentStore.getDepartmentById(request.params.id);
      if (!department) {
        return h.response("Department not found").code(404);
      }

      await db.staffStore.deleteStaff(request.params.staffid);
      return h.redirect(`/hospital/${department.hospitalId}/department/${department._id}`);
    },
  },

  deleteDepartment: {
    handler: async function (request, h) {
      const hospital = await db.hospitalStore.getHospitalById(request.params.hospitalId);
      if (!hospital) {
        return h.response("Hospital not found").code(404);
      }

      await db.departmentStore.deleteDepartmentById(request.params.id);
      return h.redirect(`/hospital/${hospital._id}`);
    },
  },
};
