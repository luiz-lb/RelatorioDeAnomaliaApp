function normalize(text) {
    return (text || '').toString().toLowerCase();
}

function filterReports(query) {
    const items = $('.searchable-item');
    const normalizedQuery = normalize(query);

    items.each(function () {
        const target = normalize($(this).attr('data-search'));
        $(this).toggle(!normalizedQuery || target.includes(normalizedQuery));
    });
}

function debounce(fn, wait) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), wait);
    };
}

export function initReportSearch() {
    const searchInput = $('#reportSearch');
    const clearBtn = $('#clearSearch');

    if (!searchInput.length) {
        return;
    }

    const debouncedHandler = debounce((value) => {
        filterReports(value);
    }, 180);

    searchInput.on('input', function () {
        debouncedHandler($(this).val());
    });

    if (clearBtn.length) {
        clearBtn.on('click', () => {
            searchInput.val('');
            searchInput.trigger('focus');
            filterReports('');
        });
    }
}

export function initUserSearch() {
    const searchInput = $('#userSearch');
    const clearBtn = $('#clearUserSearch');

    if (!searchInput.length) {
        return;
    }

    const debouncedHandler = debounce((value) => {
        filterReports(value);
    }, 180);

    searchInput.on('input', function () {
        debouncedHandler($(this).val());
    });

    if (clearBtn.length) {
        clearBtn.on('click', () => {
            searchInput.val('');
            searchInput.trigger('focus');
            filterReports('');
        });
    }
}

export function initTopSelect() {
    const topSelect = $('#topSelect');
    if (!topSelect.length) {
        return;
    }

    topSelect.on('change', function () {
        const top = $(this).val();
        window.location.href = `/fiscalizacao?top=${top}`;
    });
}