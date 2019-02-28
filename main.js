let table;
let currentEditRow;

window.onload = function () {
    if (window.jQuery) {
        $(document).ready(function () {
            const icons = '<i class="fas fa-trash removeIcon" onclick="removeRow(this)"></i> <i class="fas fa-edit editIcon" onclick="showEditModal(this)"></i>';
            const dataSetString = localStorage.getItem("table-data-set");
            if (dataSetString) {
                const dataSet = JSON.parse(dataSetString);
                dataSet.forEach(function (array) {
                    array.push(icons);
                })
                table = $('#table_id').DataTable({
                    data: dataSet
                });

            } else {
                const exampleDataSet = [
                    ["9810123456789", "example 1", "2019-02-22", "2019-02-23", "0,50", "aktiv"],
                    ["9820123456789", "example 2", "2019-02-22", "2019-02-23", "0,50", "inaktiv"]
                ];
                exampleDataSet.forEach(function (array) {
                    array.push(icons);
                })
                table = $('#table_id').DataTable({
                    data: exampleDataSet
                });
            }

            $("#add-row").on("click", function (event) {
                event.preventDefault();
                $('.fas.fa-check').css('visibility', 'visible');
                const newRow = [];
                document.querySelectorAll(".create-row .form-control").forEach(function (element) {
                    newRow.push(element.value);
                });
                newRow.push(icons);
                table.row.add(newRow).draw(false);

                window.setTimeout(() => {
                    $('.fas.fa-check').css('visibility', 'hidden');
                }, 1000);
            });


            $('#edit-row-confirm').on('click', function () {
                const editedRow = [];
                document.querySelectorAll(".edit-row-modal .form-control").forEach(function (element) {
                    editedRow.push(element.value);
                });
                editedRow.push(icons);
                table.row(currentEditRow).data(editedRow).draw();
                $('.edit-row-modal').modal('hide');
            });
        });
    }
}

window.onunload = function () {
    if (table) {
        const currentDataSet = table.rows().data().toArray();
        currentDataSet.forEach(function (array) {
            array.pop();
        });
        localStorage.setItem("table-data-set", JSON.stringify(currentDataSet));
    }
}

/**
 * Remove a row form the table.
 * @param {HTMLElement} rowChild - a child element of the row to remove.
 */
function removeRow(rowChild) {
    table
        .row($(rowChild).parents('tr'))
        .remove()
        .draw();
}

/**
 * Create the modal to edit row.
 * @param {HTMLElement} rowChild - a child element of the row to edit.
 */
function showEditModal(rowChild) {
    $('.edit-row-modal').modal('show');
    currentEditRow = $(rowChild).parents('tr');
    const rowInputValue = [];
    $(rowChild).parents('tr').find('td').each(function () {
        rowInputValue.push($(this).text());
    });

    $('.edit-row-modal .form-control').each(function (index) {
        $(this).val(rowInputValue[index]);
    });
}