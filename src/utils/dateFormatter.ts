import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import { vi } from "date-fns/locale"

function convertToDate(date: Date | string | number[] | null | undefined): Date | null {
    // Nếu đã là Date object, trả về luôn
    if (date instanceof Date) {
        return date
    }

    // Nếu null hoặc undefined, trả về null
    if (!date) {
        return null
    }

    // Nếu là chuỗi (định dạng ISO), parse thành Date
    if (typeof date === "string") {
        const parsedDate = new Date(date)
        return isNaN(parsedDate.getTime()) ? null : parsedDate
    }

    // Nếu là mảng
    if (Array.isArray(date)) {
        try {
            const [year, month, day, hour, minute, second, nanosecond] = date

            if (
                year === undefined ||
                month === undefined ||
                day === undefined ||
                hour === undefined ||
                minute === undefined ||
                second === undefined
            ) {
                console.error("Định dạng mảng LocalDateTime không hợp lệ:", date)
                return null
            }

            // Lưu ý: JavaScript đếm tháng từ 0-11, Spring Boot đếm từ 1-12
            const jsDate = new Date(year, month - 1, day, hour, minute, second)

            // Thêm milliseconds từ nanoseconds nếu có
            if (nanosecond !== undefined) {
                const milliseconds = Math.floor(nanosecond / 1_000_000)
                jsDate.setMilliseconds(milliseconds)
            }

            return isNaN(jsDate.getTime()) ? null : jsDate
        } catch (error) {
            console.error("Lỗi khi chuyển đổi:", error)
            return null
        }
    }

    console.error("Định dạng ngày không xác định:", date)
    return null
}

/**
 * Format thời gian tương đối (ví dụ: "5 phút trước", "2 giờ trước", "3 ngày trước")
 * Nếu quá 3 ngày, hiển thị định dạng DD/MM/YYYY
 */
export const formatRelativeTime = (date: Date | string | number[] | null | undefined): string => {
    const targetDate = convertToDate(date)

    if (!targetDate) {
        return "Không xác định"
    }

    const diffDays = differenceInDays(new Date(), targetDate)

    // If more than 3 days, show full date
    if (diffDays > 3) {
        return format(targetDate, "dd/MM/yyyy")
    }

    // Otherwise show relative time using date-fns
    return formatDistanceToNow(targetDate, {
        addSuffix: true,
        locale: vi,
    })
}