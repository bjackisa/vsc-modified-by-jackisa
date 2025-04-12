import { clerkClient } from "@clerk/nextjs";

async function initializeSuperAdmin() {
  try {
    const superAdmin = await clerkClient.users.getUserList({
      emailAddress: ["qudmeet@gmail.com"],
    });

    if (superAdmin.length === 0) {
      // Create super admin user
      const user = await clerkClient.users.createUser({
        emailAddress: "qudmeet@gmail.com",
        password: "admin@123",
        publicMetadata: {
          role: "super_admin",
        },
      });
      console.log("Super admin created successfully");
    } else {
      // Update existing user to super admin
      await clerkClient.users.updateUser(superAdmin[0].id, {
        publicMetadata: {
          role: "super_admin",
        },
      });
      console.log("Super admin role updated successfully");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
}

initializeSuperAdmin();