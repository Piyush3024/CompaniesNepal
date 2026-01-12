

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // console.log('📦 Seeding company types...');
    // const companyTypes = [
    //     'Manufacturer',
    //     'Supplier',
    //     'Wholesaler',
    //     'Retailer',
    //     'Distributor',
    //     'Service Provider',
    //     'Exporter',
    //     'Importer',
    //     'Trading Company',
    //     'Agent/Representative',
    // ];

    // for (const typeName of companyTypes) {
    //     await prisma.company_type.upsert({
    //         where: { name: typeName },
    //         update: {},
    //         create: {
    //             name: typeName,
    //             created_at: new Date(),
    //             updated_at: new Date(),
    //         },
    //     });
    // }
    // console.log('✅ Company types seeded successfully!');


    // console.log('📦 Seeding inquiry types...');
    // const inquiryTypes = [
    //     'Product Inquiry',
    //     'Quote Request',
    //     'Bulk Order',
    //     'Sample Request',
    //     'Custom Order',
    //     'General Inquiry',
    //     'Technical Support',
    //     'Partnership',
    // ];

    // for (const typeName of inquiryTypes) {
    //     await prisma.inquiries_type.upsert({
    //         where: { id: inquiryTypes.indexOf(typeName) + 1 },
    //         update: {},
    //         create: {
    //             name: typeName,
    //             created_at: new Date(),
    //             updated_at: new Date(),
    //         },
    //     });
    // }
    // console.log('✅ Inquiry types seeded successfully!');


    // console.log('📦 Seeding verification statuses...');
    // const verificationStatuses = [
    //     'Pending',
    //     'Verified',
    //     'Rejected',
    //     'Under Review',
    //     'Suspended',
    // ];

    // for (const statusName of verificationStatuses) {
    //     await prisma.verification_status.upsert({
    //         where: { status_name: statusName },
    //         update: {},
    //         create: {
    //             status_name: statusName,
    //             created_at: new Date(),
    //             updated_at: new Date(),
    //         },
    //     });
    // }
    // console.log('✅ Verification statuses seeded successfully!');

    console.log('📦 Seeding roles...');
    // const roles = [
    //     'admin',
    //     'seller',
    //     'buyer',
    //     'user',
    // ];

    // for (const roleName of roles) {
    //     await prisma.role.upsert({
    //         where: { name: roleName },
    //         update: {},
    //         create: {
    //             name: roleName,
    //             created_at: new Date(),
    //             updated_at: new Date(),
    //         },
    //     });
    // }
    // console.log('✅ Roles seeded successfully!');

    console.log('📦 Seeding user statuses...');
    const statuses = [
        'Active',
        'Inactive',
        'Pending',
        'Suspended',
        'Banned',
    ];

    for (const status of statuses) {
        await prisma.status.upsert({
            where: { name: status },
            update: {},
            create: {
                name: status,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    console.log('✅ User statuses seeded successfully!');


    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });