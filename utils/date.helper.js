// exports.calculateAllottedMeals = (startDate, endDate) => {

//     if (!startDate || !endDate) {
//         return 0;
//     }

//     let allottedMeals = 0;

//     let currentDate = new Date(startDate.getTime());
//     const finalDate = new Date(endDate.getTime());

//     // let currentDate = new Date(startDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
//     // const finalDate = new Date(endDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

//     currentDate.setUTCHours(0, 0, 0, 0);
//     finalDate.setUTCHours(0, 0, 0, 0);

//     while (currentDate.getTime() <= finalDate.getTime()) {
//         const dayOfWeek = currentDate.getUTCDay();

//         if (dayOfWeek === 0) {
//             allottedMeals += 1;
//         } else {
//             allottedMeals += 2;
//         }

//         currentDate.setUTCDate(currentDate.getUTCDate() + 1);
//     }

//     return allottedMeals;
// };

exports.calculateAllottedMeals = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return 0;
    }

    // This logic is now reliable because the input dates are clean UTC dates.
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    let totalDays = 0;
    let sundays = 0;

    while (currentDate.getTime() <= finalDate.getTime()) {
        totalDays++;

        if (currentDate.getUTCDay() === 0) { // 0 = Sunday
            sundays++;
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return (totalDays * 2) - sundays;
};
