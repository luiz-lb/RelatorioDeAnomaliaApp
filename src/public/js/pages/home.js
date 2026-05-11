function normalize(text) {
    return (text || '').toString().toLowerCase();
}

function filterReports(query) {
    // Seleciona linhas de qualquer corpo de tabela que possa estar presente
    // Adicionamos '.searchable-item' para que funcione com os cards da Home
    const rows = $('#tabela-corpo .searchable-item, #corpo-tabela-usuarios tr, #corpo-tabela-relatorios tr');
    const normalizedQuery = normalize(query);

    rows.each(function () {
        // Fallback inteligente: Se 'data-search' não existir, ele pesquisa no texto visível da linha.
        // Isso evita que a pesquisa quebre caso você esqueça de preencher o atributo no EJS.
        const searchData = $(this).attr('data-search') || $(this).text();
        const target = normalize(searchData);
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
    const mobileSearchInput = $('#reportSearchMobile');
    const clearBtnMobile = $('#clearSearchMobile');
    const toggleMobileBtn = $('#toggleMobileSearch');
    const mobileSearchContainer = $('#mobileSearchContainer');

    if (!searchInput.length && !mobileSearchInput.length && !toggleMobileBtn.length) {
        return;
    }

    const debouncedHandler = debounce((value) => {
        filterReports(value);
    }, 180);

    if (searchInput.length) {
        searchInput.on('input', function () {
            debouncedHandler($(this).val());
        });
    }

    if (mobileSearchInput.length) {
        mobileSearchInput.on('input', function () {
            debouncedHandler($(this).val());
        });
    }

    if (clearBtn.length) {
        clearBtn.on('click', () => {
            if (searchInput.length) {
                searchInput.val('');
                searchInput.trigger('focus');
            }
            filterReports('');
        });
    }

    if (clearBtnMobile.length) {
        clearBtnMobile.on('click', () => {
            if (mobileSearchInput.length) {
                mobileSearchInput.val('');
                mobileSearchInput.trigger('focus');
            }
            filterReports('');
        });
    }

    if (toggleMobileBtn.length && mobileSearchContainer.length) {
        toggleMobileBtn.on('click', () => {
            mobileSearchContainer.toggleClass('d-none');
            const isVisible = !mobileSearchContainer.hasClass('d-none');

            if (isVisible) {
                setTimeout(() => {
                    if (mobileSearchInput.length) {
                        mobileSearchInput.trigger('focus');
                    }
                }, 60);
            }
        });
    }
}

export function initTopEStatusSelect() {
    const topSelect = $('#topSelect');
    const statusSelect = $('#statusSelect');
    if (!topSelect.length && !statusSelect.length) {
        return;
    }

    topSelect.on('change', function () {
        const top = $(this).val();
        window.location.href = `/fiscalizacao?top=${top}&status=${statusSelect.val()}`;
    });

    statusSelect.on('change', function () {
        const status = $(this).val();
        window.location.href = `/fiscalizacao?top=${topSelect.val()}&status=${status}`;
    });
}