frappe.ui.form.on('Sales Visit Log', {

    // Trigger when Destination Odometer is changed
    destination_odometer_reading: function(frm) {
        calculate_distance(frm);
        calculate_amount(frm);
    },

    // Trigger when Start Odometer is changed
    start_odometer_reading: function(frm) {
        calculate_distance(frm);
        calculate_amount(frm);
    },

    // Trigger when Per Unit Rate is changed
    per_unit_rate: function(frm) {
        calculate_amount(frm);
    },

    // When Serial No. is changed, update usage count
    serial_no: function(frm) {
        check_duplicate_serial(frm);
    },

    // On form refresh
    refresh: function(frm) {

        if (!frm.is_new() && frm.doc.serial_no) {
            check_duplicate_serial(frm);
        }

        // Display Created By name for saved records
        if (!frm.is_new() && frm.doc.owner) {
            display_created_by(frm);
        }
    },

    // On form load: set default Per Unit Rate
    onload: function(frm) {
        if (frm.is_new() && !frm.doc.per_unit_rate) {
            frm.set_value('per_unit_rate', 1.5);
        }
    },

    // Before save actions
    before_save: function(frm) {

        // Auto-fill Start Time
        if (frm.doc.start_odometer_reading && !frm.doc.start_time) {
            frm.set_value('start_time', frappe.datetime.now_datetime());
        }

        // Auto-fill End Time
        if (frm.doc.destination_odometer_reading && !frm.doc.end_time) {
            frm.set_value('end_time', frappe.datetime.now_datetime());
        }
    },

    // After save: fetch Created By name
    after_save: function(frm) {
        display_created_by(frm);
    }

});


// Fetch and display Created By user name
function display_created_by(frm) {

    if (frm.doc.owner) {

        frappe.db.get_value('User', frm.doc.owner, 'full_name')
        .then(r => {

            let display_name = r.message.full_name || frm.doc.owner;

            frm.set_value('created_by_name', display_name);
            frm.refresh_field('created_by_name');

        });

    }

}


// Check duplicate Serial No. and show usage count
function check_duplicate_serial(frm) {

    let serial = frm.doc.serial_no;

    if (!serial) {
        frm.set_value('serial_usage_count', 0);
        frm.refresh_field('serial_usage_count');
        return;
    }

    frappe.call({
        method: 'frappe.client.get_count',
        args: {
            doctype: 'Sales Visit Log',
            filters: {
                serial_no: serial
            }
        },
        callback: function(r) {

            let count = r.message || 0;

            let display_count = frm.is_new() ? count + 1 : count;

            frm.set_value('serial_usage_count', display_count);
            frm.refresh_field('serial_usage_count');

            if (display_count > 1) {
                frm.set_df_property('serial_no', 'description', 'ℹ️ Used ' + display_count + ' times');
            } else {
                frm.set_df_property('serial_no', 'description', '');
            }

        }
    });

}


// Calculate distance
function calculate_distance(frm) {

    let start = frm.doc.start_odometer_reading || 0;
    let end = frm.doc.destination_odometer_reading || 0;

    if (end > 0) {

        if (end < start) {

            frappe.msgprint(__("Destination Odometer Reading cannot be less than Start Reading."));

            frm.set_value('destination_odometer_reading', '');
            frm.set_value('distance_traveled_km', 0);
            frm.set_value('amount', 0);

            return;
        }

        let distance = end - start;

        frm.set_value('distance_traveled_km', distance);
        frm.refresh_field('distance_traveled_km');
    }

}


// Calculate amount
function calculate_amount(frm) {

    let distance = frm.doc.distance_traveled_km || 0;
    let rate = frm.doc.per_unit_rate || 0;

    if (distance > 0 && rate > 0) {

        let amount = distance * rate;

        frm.set_value('amount', amount);
        frm.refresh_field('amount');

    } else {

        frm.set_value('amount', 0);
        frm.refresh_field('amount');

    }

}
