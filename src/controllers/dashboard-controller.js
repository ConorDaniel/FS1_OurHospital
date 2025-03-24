import { db } from "../models/db.js";
import Joi from "joi";
import { HospitalSpec } from "../models/joi-schemas.js";

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
      payload: HospitalSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("dashboard-view", {
          title: "Add Hospital Error",
          errors: error.details
        })
        .takeover()
        .code(400);
      }
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser || !loggedInUser._id) {
        return h.redirect("/login");
      }
  
      const newHospital = {
        userId: loggedInUser._id,
        name: request.payload.name,
        type: request.payload.type || "",  
        location: request.payload.location,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude
      };
  
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
