export async function notifyAdminsAndMentors(
    supabase: any,
    title: string,
    message: string,
    type: string,
    relatedId?: string
) {
    try {
        // Fetch all admins and mentors
        const { data: recipients } = await supabase
            .from('profiles')
            .select('id')
            .in('role', ['admin', 'mentor']);

        if (!recipients || recipients.length === 0) return;

        // Create notifications
        const notifications = recipients.map((r: { id: string }) => ({
            user_id: r.id,
            title,
            message,
            type,
            related_id: relatedId,
            is_read: false,
        }));

        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) console.error('Error sending notifications:', (error as any).message || error);
    } catch (error) {
        console.error('Error in notifyAdminsAndMentors:', (error as any).message || error);
    }
}
