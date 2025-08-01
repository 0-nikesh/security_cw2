// import AdminJSExpress from '@adminjs/express';
// import AdminJS from 'adminjs';
// import mongoose from 'mongoose';

// // Load models
// import Post from '../model/Post.js';
// import User from '../model/User.js';

// // Initialize AdminJS

// const adminJs = new AdminJS({
//     databases: [mongoose], // Connect MongoDB
//     rootPath: '/admin',
//     // dashboard: {
//     //     component: componentLoader.add('Dashboard', './.adminjs/bundle.js'), // Add the custom dashboard
//     //     handler: async () => {
//     //         return { message: 'Welcome to your Custom Dashboard!' }; // Optional handler to pass data to the dashboard
//     //     },
//     // },
//     // componentLoader,
//     resources: [
//         { resource: User },
//         { resource: Post },
//     ],

// });

// // Set up AdminJS router
// const adminJsRouter = AdminJSExpress.buildRouter(adminJs);

// // Export AdminJS instance and router
// export { adminJs, adminJsRouter };

// .adminjs/entry.js
import TruncateDescription from './components/truncatedtext';

AdminJS.UserComponents = {};
AdminJS.UserComponents.TruncateDescription = TruncateDescription;

