import mongoose from 'mongoose';
import Joi from 'joi';

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isBusiness: {
        type: Boolean,
        default: false
    },
    businessName: {
        type: String,
        required: function() { return this.isBusiness; }
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    }
}, { timestamps: true });

const SupportRequestsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
    },
    deviceType: {
        type: String,
        required: true,
        enum: [
            'laptop',
            'desktop',
            'printer',
            'tablet',
            'smartphone',
            'server',
            'monitor',
            'router',
            'scanner',
            'external drive',
            'keyboard',
            'mouse',
            'projector',
            'network switch',
            'other'
            ]
    },
    problemDescription: {
        type: String
    },
    quote: {
        type: String
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in-progress', 'completed']
    }
}, { timestamps: true });

const KnowledgeBaseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    symptoms: {
        type: Object,
        required: true,
    },
    solutionSteps: {
        type: Object,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['hardware', 'software']
    }
}, { timestamps: true });

const SparePartsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    partName: {
        type: String,
        required: true,
        enum: [
            "Motherboard",
            "RAM",
            "SSD",
            "HDD",
            "CPU",
            "GPU",
            "Laptop Battery",
            "Charger",
            "Cooling Fan",
            "Screen",
            "Keyboard",
            "Touchpad",
            "Hinges",
            "CMOS Battery",
            "Digitizer",
            "Camera Module",
            "Speaker",
            "Microphone",
            "SIM Tray",
            "Print Head",
            "Toner",
            "Paper Roller",
            "NIC",
            "Antenna",
            "HDMI Port",
            "BIOS Chip",
            "Thermal Paste",
            "Other"
        ]
    },
    stock: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    }
}, { timestamps: true });

const JobsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    supportRequestId: {
        type: String,
        required: true,
    },
    technician: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const TechnicianSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
export const TechnicianModel = mongoose.model('Technician', TechnicianSchema);
export const SupportRequestModel = mongoose.model('SupportRequest', SupportRequestsSchema);
export const KnowledgeBaseModel = mongoose.model('KnowledgeArticle', KnowledgeBaseSchema);
export const SparePartModel = mongoose.model('SparePart', SparePartsSchema);
export const JobsModel = mongoose.model('Job', JobsSchema);

export const UpdateRequestSchema = Joi.object({
    deviceType: Joi.string().valid(
    'laptop', 'desktop', 'printer', 'tablet', 'smartphone',
    'server', 'monitor', 'router', 'scanner', 'external drive',
    'keyboard', 'mouse', 'projector', 'network switch', 'other'
    ).optional(),
    problemDescription: Joi.string().optional(),
    quote: Joi.string().optional(),
    scheduledDate: Joi.date().optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed').optional()
});

export const UpdateUserSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    isBusiness: Joi.string().optional(),
    businessName: Joi.string().optional(),
    address: Joi.string().optional()
});

export const UpdateKnowledgeBaseSchema = Joi.object({
    title: Joi.string().optional(),
    symptoms: Joi.object().optional(),
    solutionSteps: Joi.object().optional(),
    category: Joi.string().valid('hardware', 'software').optional()
});

export const UpdateJobSchema = Joi.object({
    supportRequestId: Joi.string().optional(),
    technician: Joi.string().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    scheduledDate: Joi.date().optional(),
    completedAt: Joi.date().optional()
});

export const UpdatePartSchema = Joi.object({
    partName: Joi.string().valid(
        "Motherboard",
        "RAM",
        "SSD",
        "HDD",
        "CPU",
        "GPU",
        "Laptop Battery",
        "Charger",
        "Cooling Fan",
        "Screen",
        "Keyboard",
        "Touchpad",
        "Hinges",
        "CMOS Battery",
        "Digitizer",
        "Camera Module",
        "Speaker",
        "Microphone",
        "SIM Tray",
        "Print Head",
        "Toner",
        "Paper Roller",
        "NIC",
        "Antenna",
        "HDMI Port",
        "BIOS Chip",
        "Thermal Paste",
        "Other"
    ).optional(),
    stock: Joi.number().optional(),
    price: Joi.number().optional(),
    description: Joi.string().optional()
});