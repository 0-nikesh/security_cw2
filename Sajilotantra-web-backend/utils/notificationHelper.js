import Notification from "../model/Notification.js";
const createUserNotification = async (title, description, userId) => {
    try {
        await Notification.create({
            title,
            description,
            user_id: userId,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

export default createUserNotification;