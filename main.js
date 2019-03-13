let table;
let currentEditRow;
const icons = '<i class="fas fa-trash removeIcon" onclick="removeRow(this)"></i> <i class="fas fa-edit editIcon" onclick="showEditRowModal(this)"></i>';
let inputsMetaData = [];
let currentColumnIndex;

window.onload = function () {
    if (window.jQuery) {
        $(document).ready(function () {
            // create icon to remove and add column
            $('body').append($('<div class="float" id="column-actions"><i class="fas fa-plus-circle text-success" id="icon-add-column"></i><i class="fas fa-trash text-danger" id="icon-remove-column"></i></div>'));
            $('#column-actions').hide();

            initDataTable();
            initRowEdition();

            // initialize all tooltips
            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

            // save all created data as json
            const saveData = (function () {
                const a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                return function (data, fileName) {
                    const blob = new Blob([data], { type: "octet/stream" }),
                        url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                };
            }());

            $("#save-data").click(function () {
                const currentDataSet = JSON.parse(JSON.stringify(table.rows().data().toArray()));
                currentDataSet.forEach(function (array) {
                    array.pop();
                });
                const contentFile = JSON.stringify(currentDataSet);
                saveData(contentFile, "data.json");
                $('#save-data').tooltip('hide');
            });

            // show tipps to create new column
            if (localStorage.getItem('tippsAlreadyShowed') !== 'true' || localStorage.getItem('inputs-meta-data') === '[]') {
                $('#table_id th.default').popover({ html: true, content: 'Please move mouse over me to <strong>create new column!</strong>' });
                window.setTimeout(function () {
                    $('#table_id th.default').popover('show');
                }, 500);
                window.setTimeout(function () {
                    $('#table_id th.default').popover('hide');
                }, 10000);
                localStorage.setItem('tippsAlreadyShowed', 'true');
            }




            // Create an observer instance linked to the addRowObserverCallback callback function
            addRowObserverCallback();
            const addRowObserver = new MutationObserver(addRowObserverCallback);

            // Start observing the target node for configured mutations
            addRowObserver.observe(document.querySelector('.create-row .form-row'), { childList: true });

            // add row
            $("#add-row").on("click", function (event) {
                const inputs = document.querySelectorAll('.create-row input');
                for (let i = 0; i < inputs.length; i++) {
                    if (!inputs[i].checkValidity()) {
                        return;
                    }
                }
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
                }, 500);
            });

            // edit row
            $('#edit-row-confirm').on('click', function () {
                const inputs = document.querySelectorAll('.edit-row-modal input');
                for (let i = 0; i < inputs.length; i++) {
                    if (!inputs[i].checkValidity()) {
                        return;
                    }
                }
                event.preventDefault();
                const editedRow = [];
                document.querySelectorAll(".edit-row-modal .form-control").forEach(function (element) {
                    editedRow.push(element.value);
                });
                editedRow.push(icons);
                table.row(currentEditRow).data(editedRow).draw();
                $('.edit-row-modal').modal('hide');
            });

            // manage entry type by add column modal
            $('#create-column-input02').on('change', function () {
                $('.constrains').css('display', 'none');
                const selectValue = $(this).val();
                if (selectValue === 'drop-down') {
                    $('.type01').css('display', 'flex');
                } else if (selectValue === 'text') {
                    $('.type02').css('display', 'flex');
                } else if (selectValue === 'number') {
                    $('.type03').css('display', 'flex');
                }
                else if (selectValue === 'date') {
                    $('.type04').css('display', 'flex');
                }
            });

            // manage icon to remove and add column
            toggleColumnActionsIcons();

            $('#column-actions').on('mouseenter', function () {
                $('#column-actions').stop().fadeTo(300, 1);
            });

            $('#column-actions').on('mouseleave', function () {
                $('#column-actions').stop().fadeTo(300, 0);
                $('#column-actions').hide();
            });


            // show the add column modal
            $('#icon-add-column').on('click', function () {
                $('.add-column-modal').modal('show');
            });

            // dynamic default value by drop-down
            $('.add-column-modal #type01-input01').on('keyup', function () {
                const optionsArray = $(this).val().split(',');
                let options = '';
                optionsArray.forEach(function (value, index) {
                    options += '<option value="' + value + '"';
                    index === 0 ? options += 'selected>' : options += '>';
                    options += value + '</option>';
                });
                $('.add-column-modal #type01-input02').html($(options));
            });

            // add column validation of pattern
            // $('#type02-input02, #type03-input02').on('keyup', function () {
            //     $(this)[0].setCustomValidity('');
            //     try {
            //         new RegExp($(this).val());
            //     } catch (e) {
            //         $(this)[0].setCustomValidity('Invalid regular expression')
            //     }
            // });

            // add column
            $('#add-column').on('click', function () {
                if (!$('#create-column-input01')[0].checkValidity()) {
                    return;
                }

                const inputMetaDataObj = {};
                inputMetaDataObj.name = $('#create-column-input01').val();
                inputMetaDataObj.type = $('#create-column-input02').val();
                if (inputMetaDataObj.type === 'drop-down') {
                    const inputs = document.querySelectorAll('[id*="type01"]');
                    for (let i = 0; i < inputs.length; i++) {
                        if (!inputs[i].checkValidity()) {
                            return;
                        }
                    }
                    inputMetaDataObj.optionsArray = $('#type01-input01').val().split(',');
                    inputMetaDataObj.defaultValue = $('#type01-input02').val();
                } else if (inputMetaDataObj.type === 'text') {
                    const inputs = document.querySelectorAll('[id*="type02"]');
                    for (let i = 0; i < inputs.length; i++) {
                        if (!inputs[i].checkValidity()) {
                            return;
                        }
                    }
                    inputMetaDataObj.placeholder = $('#type02-input01').val();
                    // inputMetaDataObj.pattern = $('#type02-input02').val();
                    // default all values
                    inputMetaDataObj.pattern = '.*';
                    inputMetaDataObj.defaultValue = $('#type02-input03').val();
                } else if (inputMetaDataObj.type === 'number') {
                    const inputs = document.querySelectorAll('[id*="type03"]');
                    for (let i = 0; i < inputs.length; i++) {
                        if (!inputs[i].checkValidity()) {
                            return;
                        }
                    }
                    inputMetaDataObj.placeholder = $('#type03-input01').val();
                    // inputMetaDataObj.pattern = $('#type03-input02').val();
                    // default all values
                    inputMetaDataObj.pattern = '.*';
                    inputMetaDataObj.minValue = $('#type03-input03').val();
                    inputMetaDataObj.maxValue = $('#type03-input04').val();
                    inputMetaDataObj.defaultValue = $('#type03-input05').val();
                } else if (inputMetaDataObj.type === 'date') {
                    const inputs = document.querySelectorAll('[id*="type04"]');
                    for (let i = 0; i < inputs.length; i++) {
                        if (!inputs[i].checkValidity()) {
                            return;
                        }
                    }
                    // TODO
                }
                inputsMetaData.splice(currentColumnIndex, 0, inputMetaDataObj);
                updateRowEdition(inputMetaDataObj);

                table.destroy();
                const currentDataSet = table.rows().data().toArray();
                currentDataSet.forEach(function (array) {
                    array.pop();
                    array.splice(currentColumnIndex, 0, inputMetaDataObj.defaultValue);
                });
                localStorage.setItem("table-data-set", JSON.stringify(currentDataSet));
                $('#table_id th:nth-child(' + (currentColumnIndex + 1) + ')').before($('<th scope="col">' + inputMetaDataObj.name + '</th>'));
                toggleColumnActionsIcons('#table_id th:nth-child(' + (currentColumnIndex + 1) + ')');
                initDataTable();
                $('.add-column-modal').modal('hide');
            });

            // show remove column modal
            $('#icon-remove-column').on('click', function () {
                $('#delete-column-modal').modal('show');
            });

            // delete column confirm
            $('#delete-column-confirm').on('click', function () {
                inputsMetaData.splice(currentColumnIndex, 1);
                localStorage.setItem('inputs-meta-data', JSON.stringify(inputsMetaData));
                updateRowEdition();
                table.destroy();
                const currentDataSet = table.rows().data().toArray();
                currentDataSet.forEach(function (array) {
                    array.pop();
                    array.splice(currentColumnIndex, 1);
                });
                localStorage.setItem("table-data-set", JSON.stringify(currentDataSet));
                $('#table_id th:nth-child(' + (currentColumnIndex + 1) + ')').remove();
                $('#table_id tbody').remove();
                initDataTable();
                $('#delete-column-modal').modal('hide');
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

    if (inputsMetaData.length > 0) {
        localStorage.setItem('inputs-meta-data', JSON.stringify(inputsMetaData));
    }
}

/**
 * Init the data table
 */
function initDataTable() {
    const inputsMetaDataString = localStorage.getItem('inputs-meta-data');
    if (inputsMetaDataString && $('#table_id th').length === 1) {
        inputsMetaData = JSON.parse(inputsMetaDataString);
        inputsMetaData.forEach(function (inputMetaDataObj) {
            $('#table_id th').last().before($('<th scope="col">' + inputMetaDataObj.name + '</th>'));
        });
    }

    const dataSetString = localStorage.getItem("table-data-set");
    if (dataSetString) {
        let dataSet = JSON.parse(dataSetString);
        if (dataSet.length > 0) {
            if (dataSet[0].length === 0) {
                dataSet = [];
            } else {
                dataSet.forEach(function (array) {
                    array.push(icons);
                });
            }
        }
        table = $('#table_id').DataTable({
            data: dataSet
        });

    } else {
        const exampleDataSet = [];
        table = $('#table_id').DataTable({
            data: exampleDataSet
        });
    }
}

/**
 * create all inputs with meta data
 */
function initRowEdition() {
    const inputsMetaDataString = localStorage.getItem('inputs-meta-data');
    if (inputsMetaDataString) {
        inputsMetaData = JSON.parse(inputsMetaDataString);
        inputsMetaData.forEach(function (inputMetaDataObj) {
            const result = createInput(inputMetaDataObj);
            $('.create-row .form-row').append($(result));
            $('.edit-row-modal .form-row').append($(result));
        });
    }
}

/**
 * 
 * @param {object} inputMetaDataObj 
 * @return the html as string created with meta data
 */
function createInput(inputMetaDataObj) {
    let result = '';
    if (inputMetaDataObj.type === 'drop-down') {
        let temp = '';
        inputMetaDataObj.optionsArray.forEach(function (value, index) {
            temp += '<option value="' + value + '"';
            (value === inputMetaDataObj.defaultValue) ? temp += 'selected>' : temp += '>';
            temp += value + '</option>';
        });
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label> <select class="form-control">' + temp + '</select> </div>';
    } else if (inputMetaDataObj.type === 'text') {
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label><input type="text" class="form-control" placeholder="' + inputMetaDataObj.placeholder + '" pattern="' + inputMetaDataObj.pattern + '" required></div>';
    } else if (inputMetaDataObj.type === 'number') {
        inputMetaDataObj.placeholder = $('#type03-input01').val();
        result = '<div class="col-md-2 mb-3"><label>' + inputMetaDataObj.name + '</label><input type="number" class="form-control" placeholder="' + inputMetaDataObj.placeholder + '" pattern="' + inputMetaDataObj.pattern + '" min="' + inputMetaDataObj.minValue + '" max="' + inputMetaDataObj.maxValue + '" required></div>';
    } else if (inputMetaDataObj.type === 'date') {
        // TODO
    }
    return result;
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
function showEditRowModal(rowChild) {
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

/**
 * update the create row and edit row modal
 * @param inputMetaDataObj - the input meta data object
 */
function updateRowEdition(inputMetaDataObj) {
    if (inputMetaDataObj) {
        const targetElement = $('.create-row .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
        if (targetElement.length > 0) {
            targetElement.before($(createInput(inputMetaDataObj)));
        } else {
            $('.create-row .form-row').append($(createInput(inputMetaDataObj)));
        }

        const targetElementModal = $('.edit-row-modal .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
        if (targetElementModal.length > 0) {
            targetElementModal.before($(createInput(inputMetaDataObj)));
        } else {
            $('.edit-row-modal .form-row').append($(createInput(inputMetaDataObj)));
        }
    } else {
        const targetElement = $('.create-row .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
        targetElement.remove();
        const targetElementModal = $('.edit-row-modal .form-row div:nth-child(' + (currentColumnIndex + 1) + ')');
        targetElementModal.remove();
    }
}

/**
 * 
 * @param {string} selector 
 */
function toggleColumnActionsIcons(selector = '#table_id th') {
    $(selector).on('mouseenter', function () {
        currentColumnIndex = $('#table_id th').index($(this));
        $('#icon-remove-column').css('visibility', 'visible');
        if ($(this).hasClass('default')) {
            $('#icon-remove-column').css('visibility', 'hidden');
        }
        const tableHeadOffest = $(this).offset();
        const columnActions = $('#column-actions');
        columnActions.stop().fadeTo(300, 1);
        columnActions.offset({ top: tableHeadOffest.top - columnActions.innerWidth(), left: tableHeadOffest.left });
    });

    $(selector).on('mouseleave', function () {
        $('#column-actions').stop().fadeTo(1000, 0);
    });
}

/**
 * mutation observe create row - callback function
 * @param {object} mutations 
 */
function addRowObserverCallback(mutations = null) {
    if ($('.create-row .form-row div').length > 0) {
        $('#add-row').prop('disabled', false);
    } else {
        $('#add-row').prop('disabled', true);
    }
}