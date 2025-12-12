import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { hashId } from "../randomgenerator.js";

// const fetchInquiries = async (req, res) => {
//   try {
//     const inquiries = await prisma.inquiries.findMany({
//       select: {
//         id: true,
//         name: true,
//         inquiries_type: true,
//         email: true,
//         company_id: true,
//         message: true,
//         product_id: true,
//       },
//     });

//     const totalInquires = await prisma.inquiries.count();

//     return res.status(200).json({
//       success: true,
//       message: "Inquiries fetched Successfully",
//       data: inquiries,
//       totalInquiries: totalInquires,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error while fetching inquiries",
//     });
//   }
// };
// const createInquiry = async (req, res) => {
//   const { name, email, phone, message, inquiries_type, company_id } = req.body;
//   if (!name || !email || !phone || !message || !inquiries_type) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required",
//     });
//   }
//   try {
//     const userId = req.user?.id;

//     const inquiry = await prisma.inquiries.create({
//       data: {
//         name,
//         email,
//         phone,
//         message,
//         inquiries_type: {
//           connect: {
//             id: parseInt(inquiries_type),
//           },
//         },

//         companies: {
//           connect: {
//             id: parseInt(company_id),
//           },
//         },
//         user: {
//           connect: {
//             id: userId,
//           },
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         message: true,
//         inquiries_type: true,
//         companies: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Inquiry created successfully",
//       data: {
//         ...inquiry,
//         id: hashId(inquiry.id),

//         companies: {
//           ...inquiry.companies,
//           id: hashId(inquiry.companies.id),
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error while creating inquiry",
//     });
//   }
// };
// const updateInquiry = async (req, res) => {
//   const id = parseInt(req.params.id);
//   if (isNaN(id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid inquiry ID",
//     });
//   }
//   try {
//     console.log(req.body);

//     const { name, email, phone, message, inquiries_type } = req.body;

//     if (!name || !email || !phone || !message || !inquiries_type) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const existingInquiry = await prisma.inquiries.findUnique({
//       where: { id },
//     });
//     const updatedInquiry = await prisma.inquiries.update({
//       where: { id },
//       data: {
//         name: name ?? existingInquiry.name,
//         email: email ?? existingInquiry.email,
//         phone: phone ?? existingInquiry.phone,
//         message: message ?? existingInquiry.message,
//         inquiries_type: {
//           connect: {
//             id: parseInt(inquiries_type),
//           },
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         message: true,
//       },
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Inquiry updated successfully",
//       data: updatedInquiry,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error while updating inquiry",
//     });
//   }
// };
// const deleteInquiry = async (req, res) => {
//   const inquiryId = parseInt(req.params.id);
//   if (isNaN(inquiryId)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid inquiry ID",
//     });
//   }
//   const existingInquiry = await prisma.inquiries.findUnique({
//     where: { id: inquiryId },
//   });
//   if (!existingInquiry) {
//     return res.status(404).json({
//       success: false,
//       message: "Inquiry not found",
//     });
//   }
//   const removeInquiry = await prisma.inquiries.delete({
//     where: { id: inquiryId },
//   });
//   return res.status(200).json({
//     success: true,
//     message: "Inquiry deleted successfully",
//     data: removeInquiry,
//   });
// };

const createInquiry = async (req, res) => {
  try {
    const {
      message,
      name,
      email,
      phone,
      user_id,
      company_id,
      inquiries_type_id,
    } = req.body;

    if (!message || !name || !email || !phone || !inquiries_type_id) {
      return {
        success: false,
        message: "All fields are required",
      };
    }

    const inquiry = await prisma.inquiries.create({
      data: {
        message,
        name,
        email,
        phone,
        user_id,
        company_id,
        inquiries_type_id,
      },
    });

    await prisma.company_inquiries.create({
      data: {
        inquiry_id: inquiry.id,
        company_id: company_id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Inquiry sent succesfully",
      data: inquiry,
    });
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error while creating inquiry",
    };
  }
};

const getInquiriesForCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const inquiries = await prisma.company_inquiries.findMany({
      where: {
        company_id: companyId,
      },
      include: {
        inquiry: true,
      },
    });
    return res.status(200).json({
      sucess: true,
      message: "Inquires fetched successfully for the company",
      data: inquiries,
    });
  } catch (error) {
    console.log("error while getting the inquiry from the company", error);
  }
};

const deleteInquiryFromCompanyView = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const inquiryId = parseInt(req.params.inquiryId);
    await prisma.company_inquiries.delete({
      where: {
        inquiry_id_company_id: {
          inquiry_id: inquiryId,
          company_id: companyId,
        },
      },
    });
    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully from company view",
    });
  } catch (error) {
    console.log("error while deleting the inquiry from company view", error);
  }
};

const getInquiriesForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const inquiries = await prisma.inquiries.findMany({
      where: {
        user_id: userId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Inquiries fetched successfully for user",
      data: inquiries,
    });
  } catch (error) {
    console.log("error while getting inquiries for user", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching inquiries for user",
    });
  }
};

const getInquiryById = async (req, res) => {
  const inquiryId = parseInt(req.params.inquiryId);
  if (isNaN(inquiryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }
  try {
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
      include: {
        inquiries_type: true,
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Inquiry fetched successfully",
      data: inquiry,
    });
  } catch (error) {
    console.log("Error while fetching inquiry by ID", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching inquiry",
    });
  }
};

const updateInquiry = async (req, res) => {
  const inquiryId = parseInt(req.params.inquiryId);
  if (isNaN(inquiryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }
  try {
    const {
      message,
      name,
      email,
      phone,
      user_id,
      company_id,
      inquiries_type_id,
    } = req.body;
    if (!message || !name || !email || !phone || !inquiries_type_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingInquiry = await prisma.inquiries.findUnique({
      where: { id: inquiryId },
    });
    const updatedInquiry = await prisma.inquiries.update({
      where: { id: inquiryId },
      data: {
        message: message ?? existingInquiry.message,
        name: name ?? existingInquiry.name,
        email: email ?? existingInquiry.email,
        phone: phone ?? existingInquiry.phone,
        user_id: user_id ?? existingInquiry.user_id,
        company_id: company_id ?? existingInquiry.company_id,
        inquiries_type_id:
          inquiries_type_id ?? existingInquiry.inquiries_type_id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: updatedInquiry,
    });
  } catch (error) {
    console.log("Error while updating inquiry", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating inquiry",
    });
  }
};
const deleteInquiry = async (req, res) => {
  const inquiryId = parseInt(req.params.inquiryId);
  if (isNaN(inquiryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inquiry ID",
    });
  }
  try {
    const deletedInquiry = await prisma.inquiries.delete({
      where: {
        id: inquiryId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
      data: deletedInquiry,
    });
  } catch (error) {
    console.log("Error while deleting inquiry", error);
    res.status(500).json({
      success: false,
      message: "Error while deleting inquiry",
    });
  }
};
export {
  createInquiry,
  getInquiriesForCompany,
  deleteInquiryFromCompanyView,
  getInquiriesForUser,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
};
