exports.calculateAllottedMeals = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return 0;
    }
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    let totalDays = 0;
    let sundays = 0;

    while (currentDate.getTime() <= finalDate.getTime()) {
        totalDays++;

        if (currentDate.getUTCDay() === 0) {
            sundays++;
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return (totalDays * 2) - sundays;
};
