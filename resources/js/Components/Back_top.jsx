import '../../css/Back_top.css';
const Back_top = () => {
    const top = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        })
    }
    return (
        <>
            <div className="back_top_Hung">
                <button onClick={top} className="back_top_btn_Hung">
                    <svg height="1.2em" className="Arrow_Hung" viewBox="0 0 512 512"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"></path></svg><br />
                    <p className="Text_Hung">Back to Top</p>
                </button>
            </div>
        </>
    );
}
export default Back_top;
