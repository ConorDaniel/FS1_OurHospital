import { db } from "../models/db.js";
import Joi from "joi";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser) {
        return h.redirect("/login");
      }

      const hospitals = await db.hospitalStore.getUserHospitals(loggedInUser._id);
      console.log("Hospitals for user", loggedInUser._id, "→", hospitals);
  
      const viewData = {
        title: "Hospital Dashboard",
        user: loggedInUser,
        hospitals: hospitals,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addHospital: {
    validate: {
      payload: {
        name: Joi.string().min(1).required(),
        type: Joi.string().optional(),  
        location: Joi.string().min(1).required()
      },
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("dashboard-view", { title: "Add Hospital Error", errors: error.details })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      console.log("Logged-in user:", loggedInUser);
      
      if (!loggedInUser || !loggedInUser._id) {
        console.log("User session missing! Redirecting to login...");
        return h.redirect("/login");
      }
    
      const newHospital = {
        userId: loggedInUser._id,
        name: request.payload.name,
        type: request.payload.type || "",  
        location: request.payload.location
      };
    
      console.log("New hospital data:", newHospital);
    
      await db.hospitalStore.addHospital(newHospital);
      return h.redirect("/dashboard");
    }
  },

  deleteHospital: {
    handler: async function (request, h) {
      await db.hospitalStore.deleteHospitalById(request.params.id);
      return h.redirect("/dashboard");
    },
  },

  deleteDepartment: {
    handler: async function (request, h) {
      await db.departmentStore.deleteDepartmentById(request.params.id);
      return h.redirect("/dashboard");
    },
  },
};
